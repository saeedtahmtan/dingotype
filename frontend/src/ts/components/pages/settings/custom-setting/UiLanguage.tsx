import { For, JSXElement } from "solid-js";

import {
  setUiLanguage,
  uiLanguage,
  type UiLanguage as UiLanguageValue,
} from "../../../../i18n/store";
import { Button } from "../../../common/Button";

const OPTIONS: { value: UiLanguageValue; label: string }[] = [
  { value: "en", label: "english" },
  { value: "fa", label: "فارسی" },
];

export function UiLanguage(): JSXElement {
  return (
    <div class="grid grid-cols-2 gap-2">
      <For each={OPTIONS}>
        {(option) => (
          <Button
            active={uiLanguage() === option.value}
            onClick={() => setUiLanguage(option.value)}
          >
            {option.label}
          </Button>
        )}
      </For>
    </div>
  );
}
