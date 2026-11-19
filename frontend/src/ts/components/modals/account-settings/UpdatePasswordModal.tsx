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

export function showUpdatePasswordModal(): void {
  if (!isAuthenticated()) return;
  if (!isUsingPasswordAuthentication()) {
    showNoticeNotification(t("Password authentication is not enabled"));
    return;
  }
  showSimpleModal({
    title: t("Update password"),
    schema: z.object({
      previousPass: getPasswordSchema(),
      newPassword: getPasswordSchema({ isNew: true }),
      newPassConfirm: getPasswordSchema({ isNew: true }),
    }),
    inputs: {
      previousPass: {
        placeholder: t("current password"),
        type: "password",
      },
      newPassword: {
        placeholder: t("new password"),
        type: "password",
      },
      newPassConfirm: {
        placeholder: t("confirm new password"),
        type: "password",
      },
    },
    buttonText: t("update"),
    execFn: async ({ previousPass, newPassword, newPassConfirm }) => {
      if (newPassword !== newPassConfirm) {
        return {
          status: "notice",
          message: t("New passwords don't match"),
        };
      }

      if (newPassword === previousPass) {
        return {
          status: "notice",
          message: t("New password must be different from previous password"),
        };
      }

      const reauth = await reauthenticate({ password: previousPass });
      if (reauth.status !== "success") {
        return {
          status: reauth.status,
          message: reauth.message,
        };
      }

      const response = await Ape.users.updatePassword({
        body: { newPassword },
      });

      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to update password"),
          notificationOptions: { response },
        };
      }

      signOut();

      return {
        status: "success",
        message: t("Password updated"),
      };
    },
  });
}
