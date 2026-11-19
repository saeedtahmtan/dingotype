import { JSXElement, Show } from "solid-js";

import { isFunboxActive } from "../../../test/funbox/active";
import {
  getTranslationLanguage,
  translationSession,
  translationTotals,
} from "../../../test/translation";

/** Live translation funbox score for the current language. */
export function TranslationScore(): JSXElement {
  const language = (): "en" | "es" => getTranslationLanguage();
  const total = () => translationTotals()[language()];
  const current = () => translationSession()[language()];

  return (
    <Show when={isFunboxActive("translation")}>
      <div class="text-center text-[--sub-color]">
        {language().toUpperCase()} score {total().score}
        <span class="opacity-70">
          {" "}
          (+{current().correct} / -{current().wrong})
        </span>
      </div>
    </Show>
  );
}
