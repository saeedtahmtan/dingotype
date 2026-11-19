import { ReportUserCommentSchema } from "@monkeytype/contracts/users";
import { ReportUserReason } from "@monkeytype/schemas/users";
import { createForm } from "@tanstack/solid-form";

import Ape from "../../ape";
import { hideLoaderBar, showLoaderBar } from "../../states/loader-bar";
import { hideModal } from "../../states/modals";
import {
  showErrorNotification,
  showNoticeNotification,
  showSuccessNotification,
} from "../../states/notifications";
import { getUserToReport, setUserToReport } from "../../states/user-report";
import { AnimatedModal } from "../common/AnimatedModal";
import { Captcha } from "../ui/form/Captcha";
import { LabeledField } from "../ui/form/LabeledField";
import { SubmitButton } from "../ui/form/SubmitButton";
import { TextareaField } from "../ui/form/TextareaField";
import { allFieldsMandatory, fromSchema } from "../ui/form/utils";
import SlimSelect from "../ui/SlimSelect";
import { t } from "../../i18n/store";

export function UserReportModal() {
  const form = createForm(() => ({
    defaultValues: {
      uid: getUserToReport()?.uid ?? "",
      reason: "Inappropriate name",
      comment: "",
      captcha: "",
    },
    onSubmit: async ({ value }) => {
      await apply(value);
      form.reset();
    },
    onSubmitInvalid: () => {
      showNoticeNotification(t("Please fill in all fields"));
    },
    validators: {
      onChange: allFieldsMandatory(),
    },
  }));
  return (
    <AnimatedModal
      modalClass="max-w-3xl"
      id="UserReport"
      mode="dialog"
      title={t("Report user {name}", { name: getUserToReport()?.name ?? "" })}
    >
      <p>
        {t("Please report users responsibly and add comments in English only. Misuse may result in you losing access to this feature.")}
      </p>

      <form
        class="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="reason"
          children={(field) => (
            <LabeledField label={t("reason")}>
              <SlimSelect
                appendTo="container"
                options={[
                  { value: "Inappropriate name", text: t("Inappropriate name") },
                  { value: "Inappropriate bio", text: t("Inappropriate bio") },
                  {
                    value: "Inappropriate social links",
                    text: t("Inappropriate social links"),
                  },
                  ...[
                    !getUserToReport()?.lbOptOut
                      ? {
                          value: "Suspected cheating",
                          text: t("Suspected cheating"),
                        }
                      : undefined,
                  ],
                ].filter((it) => it !== undefined)}
                selected={field().state.value}
                onChange={(val) => field().handleChange(val as string)}
                settings={{ showSearch: false }}
              />
            </LabeledField>
          )}
        />

        <form.Field
          name="comment"
          validators={{ onChange: fromSchema(ReportUserCommentSchema) }}
          children={(field) => (
            <LabeledField label={t("comment")}>
              <div class="relative">
                <TextareaField
                  field={field}
                  class="bg-bg-secondary min-h-50 w-full rounded p-2 text-text"
                  autocomplete="off"
                />
                <div
                  class={`absolute right-2 bottom-2 text-xs ${250 - field().state.value.length < 0 ? "text-error" : "text-sub"}`}
                >
                  {250 - field().state.value.length}
                </div>
              </div>
            </LabeledField>
          )}
        />
        <form.Field
          name="captcha"
          children={(field) => <Captcha field={field} />}
        />
        <SubmitButton form={form} text="report" class="w-full" />
      </form>
    </AnimatedModal>
  );
}

async function apply(options: {
  uid: string;
  reason: string;
  comment: string;
  captcha: string;
}): Promise<void> {
  const { uid, reason, comment, captcha } = options;

  showLoaderBar();
  const response = await Ape.users.report({
    body: {
      uid,
      reason: reason as ReportUserReason,
      comment,
      captcha,
    },
  });
  hideLoaderBar();

  if (response.status !== 200) {
    showErrorNotification(t("Failed to report user"), { response });
    return;
  }

  showSuccessNotification(t("Report submitted. Thank you!"));
  setUserToReport(null);
  hideModal("UserReport");
}
