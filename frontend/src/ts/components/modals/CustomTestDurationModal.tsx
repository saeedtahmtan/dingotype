import { createForm } from "@tanstack/solid-form";
import { JSXElement } from "solid-js";

import { setConfig } from "../../config/setters";
import { getConfig } from "../../config/store";
import { hideModalAndClearChain } from "../../states/modals";
import { showNoticeNotification } from "../../states/notifications";
import { restartTest } from "../../test/test-logic";
import { AnimatedModal } from "../common/AnimatedModal";
import { InputField } from "../ui/form/InputField";
import { SubmitButton } from "../ui/form/SubmitButton";
import { t } from "../../i18n/store";

export function CustomTestDurationModal(): JSXElement {
  const form = createForm(() => ({
    defaultValues: {
      duration: getConfig.time.toString(),
    },
    onSubmit: ({ value }) => {
      const val = parseInput(value.duration);

      if (isNaN(val) || val < 0 || !isFinite(val)) {
        showNoticeNotification(t("Custom time must be a positive number or zero"));
        return;
      }

      setConfig("time", val);
      void restartTest();

      if (val >= 1800) {
        showNoticeNotification(t("Stay safe and take breaks!"));
      } else if (val === 0) {
        showNoticeNotification(
          t("Infinite time! Make sure to use Bail Out from the command line to save your result."),
          { durationMs: 7000 },
        );
      }

      hideModalAndClearChain("TestDuration");
    },
  }));

  const durationValue = form.useSelector((s) => s.values.duration);

  const humanTime = () => {
    const duration = parseInput(durationValue());

    if (duration < 0) {
      return t("Negative time? Really?");
    } else if (duration === 0) {
      return t("Infinite test");
    } else {
      return format(duration);
    }
  };

  return (
    <AnimatedModal
      id="TestDuration"
      title={t("Test Duration")}
      focusFirstInput="focusAndSelect"
      beforeShow={() => {
        form.reset({ duration: getConfig.time.toString() });
      }}
    >
      <form
        class="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div class="text-xs">{humanTime()}</div>
        <form.Field
          name="duration"
          validators={{
            onChange: ({ value }) => {
              const val = parseInput(value);
              if (isNaN(val) || !isFinite(val)) return t("Must be a number");
              if (val < 0) return t("Must be non-negative");
              return undefined;
            },
          }}
          children={(field) => (
            <InputField field={field} type="text" placeholder={t("duration")} />
          )}
        />
        <div class="text-xs">
          {t('You can use "h" for hours and "m" for minutes, for example "1h30m".')}
          <br />
          <br />
          {t("You can start an infinite test by inputting 0. Then, to stop the test, use the Bail Out feature:")}
          <br />(<kbd>esc</kbd> or <kbd>ctrl/cmd</kbd> + <kbd>shift</kbd> +{" "}
          <kbd>p</kbd> &gt; Bail Out)
        </div>
        <SubmitButton
          form={form}
          variant="button"
          text="apply"
          skipUnchangedCheck
        />
      </form>
    </AnimatedModal>
  );
}

function format(duration: number): string {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const time = [];

  if (hours > 0) {
    time.push(t("{count} hours", { count: hours }));
  }

  if (minutes > 0) {
    time.push(t("{count} minutes", { count: minutes }));
  }

  if (seconds > 0) {
    time.push(t("{count} seconds", { count: seconds }));
  }

  if (time.length === 0) {
    return t("0 seconds");
  } else if (time.length === 3) {
    return t("{a}, {b} and {c}", { a: time[0] ?? "", b: time[1] ?? "", c: time[2] ?? "" });
  } else if (time.length === 2) {
    return t("{a} and {b}", { a: time[0] ?? "", b: time[1] ?? "" });
  } else {
    return `${time[0]}`;
  }
}

function parseInput(input: string): number {
  const re = /((-\s*)?\d+(\.\d+)?\s*[hms]?)/g;
  const seconds = [...input.toLowerCase().matchAll(re)]
    .map((match) => {
      const part = match[0];
      const duration = parseFloat(part.replace(/\s+/g, ""));

      if (part.includes("h")) {
        return 3600 * duration;
      } else if (part.includes("m")) {
        return 60 * duration;
      } else {
        return duration;
      }
    })
    .reduce((total, dur) => total + dur, 0);

  return Math.floor(seconds);
}
