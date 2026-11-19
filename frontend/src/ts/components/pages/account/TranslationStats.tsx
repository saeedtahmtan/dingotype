import { For, JSXElement, Show } from "solid-js";

import { t } from "../../../i18n/store";
import {
  translationWordStats,
  type TranslationLanguage,
} from "../../../test/translation";

const LANGUAGES: { language: TranslationLanguage; label: string }[] = [
  { language: "en", label: "english" },
  { language: "es", label: "spanish" },
];

type Summary = {
  known: number;
  missed: number;
  total: number;
  missedWords: { source: string; answer: string; wrong: number }[];
};

function summarize(language: TranslationLanguage): Summary {
  const entries = Object.entries(translationWordStats()[language]);
  const missedWords = entries
    .filter(([, stats]) => stats.wrong > 0)
    .map(([source, stats]) => ({
      source,
      answer: stats.answer,
      wrong: stats.wrong,
    }))
    .sort((a, b) => b.wrong - a.wrong);

  return {
    known: entries.filter(([, stats]) => stats.correct > 0).length,
    missed: missedWords.length,
    total: entries.length,
    missedWords: missedWords.slice(0, 12),
  };
}

/** Offline translation statistics: known and missed words per language. */
export function TranslationStats(): JSXElement {
  return (
    <div class="grid gap-4">
      <div class="text-center text-sub">
        {t("translation words")}
        <div class="text-xs">
          {t("known = answered correctly at least once")}
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <For each={LANGUAGES}>
          {(language) => {
            const data = (): Summary => summarize(language.language);
            return (
              <div class="grid gap-3 rounded p-4 ring-2 ring-sub-alt">
                <div class="text-sub">{t(language.label)}</div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <div class="text-sub">{t("words known")}</div>
                    <div class="text-4xl text-main">{data().known}</div>
                  </div>
                  <div>
                    <div class="text-sub">{t("words missed")}</div>
                    <div class="text-4xl text-error">{data().missed}</div>
                  </div>
                </div>
                <div class="text-xs text-sub">
                  {t("{count} words practiced", { count: data().total })}
                </div>
                <Show when={data().missedWords.length > 0}>
                  <div class="grid gap-1">
                    <div class="text-xs text-sub">{t("most missed")}</div>
                    <div class="flex flex-wrap gap-1 text-xs">
                      <For each={data().missedWords}>
                        {(word) => (
                          <span
                            class="rounded bg-sub-alt px-2 py-1"
                            title={t("missed {count} time(s)", {
                              count: word.wrong,
                            })}
                          >
                            {word.source} → {word.answer}
                            <span class="text-sub"> ×{word.wrong}</span>
                          </span>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
