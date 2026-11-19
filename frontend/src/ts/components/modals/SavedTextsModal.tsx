import { createSignal, For, Index, JSXElement, Setter, Show } from "solid-js";

import { createTrigger } from "../../hooks/createTrigger";
import { setCustomTextIndicator } from "../../states/core";
import { hideModal } from "../../states/modals";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../states/notifications";
import { showSimpleModal } from "../../states/simple-modal";
import * as CustomText from "../../test/custom-text";
import { download } from "../../utils/misc";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { Separator } from "../common/Separator";
import { t } from "../../i18n/store";

type CustomTextIncomingData =
  | ({
      set?: boolean;
      long?: boolean;
      pipeDelimiter?: boolean;
    } & (
      | { text: string; splitText?: never }
      | { text?: never; splitText: string[] }
    ))
  | null;

function getSavedText(name: string, long: boolean): string {
  let text = CustomText.getCustomText(name, long);
  if (long) {
    text = text.slice(CustomText.getCustomTextLongProgress(name));
  }
  return text.join(
    CustomText.getCustomTextIsPipeDelimiter(name, long) ? "|" : " ",
  );
}

export function SavedTextsModal(props: {
  setChainedData: Setter<CustomTextIncomingData>;
}): JSXElement {
  const [names, setNames] = createSignal<string[]>([]);
  const [longNames, setLongNames] = createSignal<string[]>([]);

  // because the progress is stored in local storage,
  // we need to trigger a refresh when it changes to update the reset button state
  const [trackProgress, refreshProgress] = createTrigger();

  const refresh = () => {
    setNames(CustomText.getCustomTextNames(false));
    setLongNames(CustomText.getCustomTextNames(true));
    refreshProgress();
  };

  const handleNameClick = (name: string, long: boolean) => {
    setCustomTextIndicator({ name, isLong: long });
    const text = getSavedText(name, long);
    props.setChainedData({
      text,
      long,
      pipeDelimiter: CustomText.getCustomTextIsPipeDelimiter(name, long),
    });
    hideModal("SavedTexts");
  };

  const handleDelete = (name: string, long: boolean) => {
    showSimpleModal({
      title: t("Delete custom text"),
      text: t("Are you sure you want to delete custom text {name}?", { name }),
      buttonText: t("delete"),
      execFn: async () => {
        CustomText.deleteCustomText(name, long);
        setCustomTextIndicator(undefined);
        refresh();
        return {
          status: "success",
          message: t("Custom text deleted"),
        };
      },
    });
  };

  const handleResetProgress = (name: string) => {
    showSimpleModal({
      title: t("Reset progress for custom text"),
      text: t("Are you sure you want to reset your progress for custom text {name}?", { name }),
      buttonText: t("reset"),
      execFn: async () => {
        CustomText.setCustomTextLongProgress(name, 0);
        const text = CustomText.getCustomText(name, true);
        CustomText.setPipeDelimiter(
          CustomText.getCustomTextIsPipeDelimiter(name, true),
        );
        CustomText.setText(text);
        refresh();
        return {
          status: "success",
          message: t("Custom text progress reset"),
        };
      },
    });
  };

  const handleDownload = (name: string, long: boolean) => {
    const text = CustomText.getCustomText(name, long);

    try {
      const data = new Blob(
        [
          text.join(
            CustomText.getCustomTextIsPipeDelimiter(name, long) ? "|" : " ",
          ),
        ],
        { type: "text/plain" },
      );
      download({ filename: `${name}.txt`, data });
      showSuccessNotification(t("custom text downloaded"));
    } catch (e) {
      showErrorNotification(t("failed to download custom text: {error}", { error: String(e) }));
    }
  };

  return (
    <AnimatedModal
      id="SavedTexts"
      title={t("Saved texts")}
      modalClass="max-w-[500px]"
      beforeShow={refresh}
    >
      <div class="grid gap-2">
        <Show
          when={names().length > 0}
          fallback={<div class="text-sub">{t("No saved custom texts found")}</div>}
        >
          <For each={names()}>
            {(name) => (
              <div class="flex items-center gap-2">
                <Button
                  variant="button"
                  text={name}
                  class="flex-1"
                  onClick={() => handleNameClick(name, false)}
                />
                <Button
                  variant="button"
                  balloon={{ text: t("download") }}
                  fa={{ icon: "fa-file-download", fixedWidth: true }}
                  onClick={() => handleDownload(name, false)}
                />
                <Button
                  variant="button"
                  fa={{ icon: "fa-trash", fixedWidth: true }}
                  balloon={{ text: t("delete") }}
                  onClick={() => handleDelete(name, false)}
                />
              </div>
            )}
          </For>
        </Show>
      </div>

      <div class="text-2xl text-sub">{t("Saved long texts")}</div>

      <div class="grid gap-2">
        <Show
          when={longNames().length > 0}
          fallback={
            <div class="text-sub">{t("No saved long custom texts found")}</div>
          }
        >
          <Index each={longNames()}>
            {(name) => {
              const hasProgress = () => {
                trackProgress();
                return CustomText.getCustomTextLongProgress(name()) > 0;
              };
              return (
                <div class="flex items-center gap-2">
                  <Button
                    variant="button"
                    text={name()}
                    class="flex-1"
                    onClick={() => handleNameClick(name(), true)}
                  />
                  <Button
                    variant="button"
                    text="reset"
                    disabled={!hasProgress()}
                    onClick={() => handleResetProgress(name())}
                  />
                  <Button
                    variant="button"
                    balloon={{ text: "download" }}
                    fa={{ icon: "fa-file-download", fixedWidth: true }}
                    onClick={() => handleDownload(name(), true)}
                  />
                  <Button
                    variant="button"
                    fa={{ icon: "fa-trash", fixedWidth: true }}
                    balloon={{ text: "delete" }}
                    onClick={() => handleDelete(name(), true)}
                  />
                </div>
              );
            }}
          </Index>
        </Show>
      </div>

      <Separator />

      <div class="text-em-xs text-error">
        {t("Heads up! These texts are only stored locally. If you switch devices or clear your local browser data they will be lost.")}
      </div>
    </AnimatedModal>
  );
}
