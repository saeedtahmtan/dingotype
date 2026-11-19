import { UserEmailSchema } from "@monkeytype/schemas/users";
import { z } from "zod";

import Ape from "../../../ape";
import {
  getPasswordSchema,
  isUsingPasswordAuthentication,
  reauthenticate,
  signOut,
} from "../../../auth";
import { t } from "../../../i18n/store";
import { isAuthenticated } from "../../../states/core";
import { showNoticeNotification } from "../../../states/notifications";
import { showSimpleModal } from "../../../states/simple-modal";

export function showUpdateEmailModal(): void {
  if (!isAuthenticated()) return;
  if (!isUsingPasswordAuthentication()) {
    showNoticeNotification(t("Password authentication is not enabled"));
    return;
  }

  showSimpleModal({
    title: t("Update email"),
    buttonText: t("update"),
    schema: z.object({
      password: getPasswordSchema(),
      email: UserEmailSchema,
      emailConfirm: UserEmailSchema,
    }),
    inputs: {
      password: {
        placeholder: t("Password"),
        type: "password",
      },
      email: {
        type: "text",
        placeholder: t("New email"),
      },
      emailConfirm: {
        type: "text",
        placeholder: t("Confirm new email"),
      },
    },

    execFn: async ({ password, email, emailConfirm }) => {
      if (email !== emailConfirm) {
        return {
          status: "notice",
          message: t("Emails don't match"),
        };
      }

      const reauth = await reauthenticate({ password });
      if (reauth.status !== "success") {
        return {
          status: reauth.status,
          message: reauth.message,
        };
      }

      const response = await Ape.users.updateEmail({
        body: {
          newEmail: email,
          previousEmail: reauth.user.email as string,
        },
      });

      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to update email"),
          notificationOptions: { response },
        };
      }

      signOut();

      return {
        status: "success",
        message: t("Email updated"),
      };
    },
  });
}
