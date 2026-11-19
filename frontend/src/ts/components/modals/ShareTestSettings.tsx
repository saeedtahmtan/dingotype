import { createForm } from "@tanstack/solid-form";
import { JSXElement, Show } from "solid-js";

import { getConfig } from "../../config/store";
import { showSuccessNotification } from "../../states/notifications";
import { getCurrentQuote } from "../../states/test";
import * as CustomText from "../../test/custom-text";
import { buildTestSettingsLink } from "../../url-actions/actions/test-settings";
import { cn } from "../../utils/cn";
import { getMode2 } from "../../utils/misc";
import { capitalizeFirstLetter } from "../../utils/strings";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { Fa } from "../common/Fa";
import { Checkbox } from "../ui/form/Checkbox";
import { t } from "../../i18n/store";

export function ShareTestSettings(): JSXElement {
  const form = createForm(() => ({
    defaultValues: {
      mode: false,
      mode2: false,
      customText: false,
      punctuation: false,
      numbers: false,
      language: false,
      difficulty: false,
      funbox: false,
    },
  }));

  const formValues = form.useSelector((s) => s.values);

  const url = () => {
    const values = formValues();
    return buildTestSettingsLink({
      mode: values.mode ? getConfig.mode : undefined,
      mode2: values.mode2 ? getMode2(getConfig, getCurrentQuote()) : undefined,
      customText: values.customText ? CustomText.getData() : undefined,
      punctuation: values.punctuation ? getConfig.punctuation : undefined,
      numbers: values.numbers ? getConfig.numbers : undefined,
      language: values.language ? getConfig.language : undefined,
      difficulty: values.difficulty ? getConfig.difficulty : undefined,
      funbox: values.funbox ? getConfig.funbox : undefined,
    });
  };

  const mode2subtext = () => {
    let out = "";
    if (getConfig.mode === "quote") {
      out += `${t("Quote ID")} `;
    }
    out += capitalizeFirstLetter(
      t(getMode2(getConfig, getCurrentQuote()) || "none"),
    );

    if (getConfig.mode === "time") {
      out += ` ${t("seconds")}`;
    }
    if (getConfig.mode === "words") {
      out += ` ${t("words")}`;
    }

    return out;
  };

  return (
    <AnimatedModal id="ShareTestSettings" title={t("Share test settings")}>
      <form.Field
        name="mode"
        listeners={{
          onChange: ({ value }) => {
            if (!value) {
              form.setFieldValue("mode2", false);
              form.setFieldValue("customText", false);
            }
          },
        }}
      >
        {(field) => (
          <Checkbox
            field={() => field()}
            class="items-start"
            label={
              <div>
                <div>{t("Mode")}</div>
                <div class="text-em-xs text-sub">
                  {capitalizeFirstLetter(t(getConfig.mode))}
                </div>
              </div>
            }
          />
        )}
      </form.Field>

      <Show when={getConfig.mode === "custom"}>
        <form.Field name="customText">
          {(field) => (
            <Checkbox
              field={() => field()}
              class={cn(
                "ml-8 items-start",
                formValues().mode ? "" : "pointer-events-none opacity-33",
              )}
              label={
                <div>
                  <div>{t("Custom text")}</div>
                  <div class="text-em-xs text-sub">
                    {CustomText.getData().text.length}{" "}
                    {CustomText.getData().pipeDelimiter ? t("sections") : t("words")},{" "}
                    {t(CustomText.getData().mode)} {t("mode")},{" "}
                    {CustomText.getData().limit.value}{" "}
                    {t(CustomText.getData().limit.mode)} {t("limit")}
                  </div>
                </div>
              }
            />
          )}
        </form.Field>
      </Show>
      <Show when={getConfig.mode !== "custom" && getConfig.mode !== "zen"}>
        <form.Field name="mode2">
          {(field) => (
            <Checkbox
              field={() => field()}
              class={cn(
                "ml-8 items-start",
                formValues().mode ? "" : "pointer-events-none opacity-33",
              )}
              label={
                <div>
                  <div>{t("Mode2")}</div>
                  <div class="text-em-xs text-sub">{mode2subtext()}</div>
                </div>
              }
            />
          )}
        </form.Field>
      </Show>

      <Show when={getConfig.mode !== "zen"}>
        <form.Field name="punctuation">
          {(field) => (
            <Checkbox
              field={() => field()}
              class="items-start"
              label={
                <div>
                  <div>{t("Punctuation")}</div>
                  <div class="text-em-xs text-sub">
                    {getConfig.punctuation ? t("enabled") : t("disabled")}
                  </div>
                </div>
              }
            />
          )}
        </form.Field>
        <form.Field name="numbers">
          {(field) => (
            <Checkbox
              field={() => field()}
              class="items-start"
              label={
                <div>
                  <div>{t("Numbers")}</div>
                  <div class="text-em-xs text-sub">
                    {getConfig.numbers ? t("enabled") : t("disabled")}
                  </div>
                </div>
              }
            />
          )}
        </form.Field>
        <form.Field name="language">
          {(field) => (
            <Checkbox
              field={() => field()}
              class="items-start"
              label={
                <div>
                  <div>{t("Language")}</div>
                  <div class="text-em-xs text-sub">{getConfig.language}</div>
                </div>
              }
            />
          )}
        </form.Field>
        <form.Field name="difficulty">
          {(field) => (
            <Checkbox
              field={() => field()}
              class="items-start"
              label={
                <div>
                  <div>{t("Difficulty")}</div>
                  <div class="text-em-xs text-sub">{getConfig.difficulty}</div>
                </div>
              }
            />
          )}
        </form.Field>
      </Show>
      <form.Field name="funbox">
        {(field) => (
          <Checkbox
            field={() => field()}
            class="items-start"
            label={
              <div>
                <div>{t("Funbox")}</div>
                <div class="text-em-xs text-sub">
                  {getConfig.funbox.length > 0
                    ? getConfig.funbox.join(", ")
                    : t("none")}
                </div>
              </div>
            }
          />
        )}
      </form.Field>
      <textarea
        placeholder={t("url")}
        value={url()}
        readOnly
        onClick={(e) => e.currentTarget.select()}
      ></textarea>
      <Button
        variant="button"
        text="copy to clipboard"
        fa={{
          icon: "fa-copy",
        }}
        onClick={() => {
          void navigator.clipboard
            .writeText(url())
            .then(() => {
              showSuccessNotification(t("URL copied to clipboard"));
            })
            .catch((error: unknown) => {
              showSuccessNotification(t("Failed to copy URL"), { error });
            });
        }}
      />
      <Show when={url().length > 2000}>
        <div class="flex place-items-center gap-2 text-xs text-error">
          <Fa icon="fa-exclamation-triangle" />
          <span>{t("The URL is over 2000 characters long - it might not work")}</span>
        </div>
      </Show>
    </AnimatedModal>
  );
}
