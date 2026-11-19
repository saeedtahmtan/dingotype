import { Link } from "@tanstack/solid-router";
import { JSXElement } from "solid-js";

import { hideModal } from "../../states/modals";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { t } from "../../i18n/store";

export function ContactModal(): JSXElement {
  const buttonClass = " gap-4 text-md p-4 text-lg justify-start";

  return (
    <AnimatedModal id="Contact" modalClass="max-w-4xl" title={t("Contact")}>
      <div>
        {t("Feel free to send an email to contact@monkeytype.com. For business inquiries, email jack@monkeytype.com (the buttons below will open the default mail client).")}
        <br />
        <br />
        {t("Please")}{" "}
        <span class="text-error">{t("do not send")}</span>{" "}
        {t("requests to delete account, update email, update name or clear personal bests - you can do that in the")}{" "}
        <Link
          to="/account-settings"
          onClick={() => {
            hideModal("Contact");
          }}
        >
          {t("account settings")}
        </Link>{" "}
        {t("page.")}
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <Button
          variant="button"
          href="mailto:contact@monkeytype.com?subject=[Question] "
          text="Question"
          class={buttonClass}
          fa={{
            icon: "fa-question-circle",
            fixedWidth: true,
          }}
        />
        <Button
          variant="button"
          href="mailto:contact@monkeytype.com?subject=[Feedback] "
          fa={{
            icon: "fa-comment-dots",
            fixedWidth: true,
          }}
          text="Feedback"
          class={buttonClass}
        />
        <Button
          variant="button"
          href="mailto:support@monkeytype.com?subject=[Bug] "
          fa={{
            icon: "fa-bug",
            fixedWidth: true,
          }}
          text="Bug Report"
          class={buttonClass}
        />
        <Button
          variant="button"
          href="mailto:support@monkeytype.com?subject=[Account] "
          fa={{
            icon: "fa-user-circle",
            fixedWidth: true,
          }}
          text="Account Help"
          class={buttonClass}
        />
        <Button
          variant="button"
          href="mailto:jack@monkeytype.com?subject=[Business] "
          fa={{
            icon: "fa-briefcase",
            fixedWidth: true,
          }}
          text="Business Inquiry"
          class={buttonClass}
        />
        <Button
          variant="button"
          href="mailto:contact@monkeytype.com?subject=[Other] "
          fa={{
            icon: "fa-ellipsis-h",
            fixedWidth: true,
          }}
          text="Other"
          class={buttonClass}
        />
      </div>
    </AnimatedModal>
  );
}
