import { createMemo, Index, JSXElement, onCleanup, onMount } from "solid-js";

import { getConfig } from "../../../config/store";
import {
  registerWordElement,
  unregisterWordElement,
} from "../../../states/word-elements";
import { RenderedWord, wordsRenderState } from "../../../states/words-render";
import { isFunboxActive } from "../../../test/funbox/active";
import {
  getTranslationHint,
  isAnswerWord,
  isTranslationActive,
  isTranslationAnswerRevealed,
  type TranslationHint,
} from "../../../test/translation";
import { cn } from "../../../utils/cn";
import { buildBalloonHtmlProperties } from "../../common/Balloon";
import { createLetters, createZenLetters } from "./letters";
import { TypoHints } from "./TypoHints";
import { WordLetter } from "./WordLetter";

export type WordStatus = "untyped" | "typed" | "typedIncorrectly";

/** A rendered word: its letters and hints container. */
export function Word(props: {
  word: RenderedWord;
  isActive: (index: number) => boolean;
}): JSXElement {
  const letters = createMemo(() =>
    wordsRenderState.rendersLettersFromInput
      ? createZenLetters(props.word.input, props.word.composition)
      : createLetters(props.word, {
          replaceTypos:
            getConfig.indicateTypos === "replace" ||
            getConfig.indicateTypos === "both",
          replaceComposition: getConfig.compositionDisplay === "replace",
        }),
  );
  // committed input (trailing space stripped) differs from the word, same as
  // the commit check. Blind CSS hides it. Zen words have no text to compare
  // against
  const isIncorrect = (): boolean =>
    props.word.isTyped &&
    !wordsRenderState.rendersLettersFromInput &&
    props.word.input !== props.word.text;
  const status = (): WordStatus => {
    if (isIncorrect()) return "typedIncorrectly";
    return props.word.isTyped ? "typed" : "untyped";
  };
  const isTranslationAnswer = (): boolean =>
    isFunboxActive("translation") &&
    isTranslationActive() &&
    isAnswerWord(props.word.index);
  const isTranslationMasked = (): boolean =>
    isTranslationAnswer() &&
    !isTranslationAnswerRevealed(props.word.index) &&
    !props.word.isTyped;
  const translationHint = (): TranslationHint | undefined =>
    isTranslationAnswer() && isTranslationAnswerRevealed(props.word.index)
      ? getTranslationHint(props.word.index)
      : undefined;
  // multiple meanings: list them all, mark the one used in this test
  const translationBalloon = () => {
    const hint = translationHint();
    if (hint === undefined) return undefined;
    if (hint.text !== undefined) {
      return { text: hint.text, length: "large" as const };
    }
    const others = (hint.meanings ?? []).filter((m) => m !== hint.active);
    const text =
      others.length === 0
        ? `meaning: ${hint.active ?? ""}`
        : `meaning: ${hint.active ?? ""}\nalso: ${others.join(", ")}`;
    return { text, break: true, length: "large" as const };
  };
  let wordRef: HTMLDivElement | undefined;

  onMount(() => {
    const el = wordRef;
    if (el === undefined) return;
    const index = props.word.index;
    registerWordElement(index, el);
    onCleanup(() => unregisterWordElement(index, el));
  });

  return (
    <div
      ref={(el) => (wordRef = el)}
      data-wordindex={props.word.index}
      data-ui-element="word"
      {...buildBalloonHtmlProperties(translationBalloon())}
      dir={props.word.direction}
      data-ui-state={status()}
      data-ui-active={props.isActive(props.word.index) ? "" : undefined}
      data-ui-translation={
        isTranslationMasked()
          ? "masked"
          : isTranslationAnswer()
            ? "answer"
            : undefined
      }
      data-ui-translation-note={
        translationHint() === undefined ? undefined : ""
      }
      class={cn("word", {
        active: props.isActive(props.word.index),
        typed: props.word.isTyped,
        error: isIncorrect(),
        // letters run in the word's direction, so the caret can rely on it
        "[unicode-bidi:bidi-override]": props.word.direction !== undefined,
      })}
    >
      <Index each={letters()}>
        {(letter) => <WordLetter letter={letter()} />}
      </Index>
      <TypoHints word={props.word} />
    </div>
  );
}
