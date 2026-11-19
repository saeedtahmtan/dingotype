import { z } from "zod";

import Ape from "../../../ape";
import {
  getPasswordSchema,
  isUsingPasswordAuthentication,
  reauthenticate,
} from "../../../auth";
import { resetConfig } from "../../../config/lifecycle";
import { t } from "../../../i18n/store";
import { resetPersonalBests } from "../../../queries/user";
import { isAuthenticated } from "../../../states/core";
import { showNoticeNotification } from "../../../states/notifications";
import { ExecReturn, showSimpleModal } from "../../../states/simple-modal";
import FileStorage from "../../../utils/file-storage";
import { reloadAfter } from "../../../utils/misc";

export function showDeleteAccountModal(): void {
  showReauthConfirmModal({
    title: t("Delete account"),
    buttonText: t("delete"),
    confirmText: t(
      `I understand that all my data will be deleted and cannot be recovered.`,
    ),
    action: async () => {
      showNoticeNotification(t("Deleting all data..."));
      const response = await Ape.users.delete();

      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to delete user data"),
          notificationOptions: { response },
        };
      }
      reloadAfter(3);

      return {
        status: "success",
        message: t("Account deleted, goodbye"),
      };
    },
  });
}

export function showOptOutOfLeaderboardsModal(): void {
  showReauthConfirmModal({
    title: t("Opt out of leaderboards"),
    buttonText: t("opt out"),
    confirmText: t(
      `I understand that my account will be removed from all leaderboards and that this cannot be undone.`,
    ),

    action: async () => {
      const response = await Ape.users.optOutOfLeaderboards();
      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to opt out"),
          notificationOptions: { response },
        };
      }

      reloadAfter(3);

      return {
        status: "success",
        message: t("Leaderboards opt out successful"),
      };
    },
  });
}

export function showResetAccountModal(): void {
  showReauthConfirmModal({
    title: t("Reset account"),
    buttonText: t("reset"),
    confirmText: t(
      `I understand that my account will be completely reset and that this cannot be undone.`,
    ),
    action: async () => {
      showNoticeNotification(t("Resetting settings..."));
      await resetConfig();
      await FileStorage.deleteFile("LocalBackgroundFile");
      await FileStorage.deleteFile("LocalFontFamilyFile");

      showNoticeNotification(t("Resetting account..."));
      const response = await Ape.users.reset();
      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to reset account"),
          notificationOptions: { response },
        };
      }

      reloadAfter(3);

      return {
        status: "success",
        message: t("Account reset"),
      };
    },
  });
}

export function showResetPersonalBestsModal(): void {
  showReauthConfirmModal({
    title: t("Reset personal bests"),
    buttonText: t("reset"),
    confirmText: t(
      `I understand that all my personal bests will be deleted and that this cannot be undone.`,
    ),
    action: async () => {
      const response = await Ape.users.deletePersonalBests();
      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to reset personal bests"),
          notificationOptions: { response },
        };
      }

      resetPersonalBests();

      return {
        status: "success",
        message: t("Personal bests reset"),
      };
    },
  });
}

export function showRevokeAllTokensModal() {
  showReauthConfirmModal({
    title: t("Revoke all tokens"),
    confirmText: t(
      `I understand that all my tokens will get revoked and that I will be logged out of all devices.`,
    ),
    buttonText: t("revoke all"),
    action: async () => {
      const response = await Ape.users.revokeAllTokens();
      if (response.status !== 200) {
        return {
          status: "error",
          message: t("Failed to revoke tokens"),
          notificationOptions: { response },
        };
      }

      reloadAfter(3);

      return {
        status: "success",
        message: t("Tokens revoked"),
      };
    },
  });
}

function showReauthConfirmModal(options: {
  title: string;
  buttonText: string;
  confirmText: string;
  action: () => Promise<ExecReturn>;
}): void {
  if (!isAuthenticated()) return;

  showSimpleModal({
    title: options.title,
    buttonText: isUsingPasswordAuthentication()
      ? options.buttonText
      : t("reauthenticate to {action}", { action: options.buttonText }),
    schema: z.object({
      password: getPasswordSchema(),
      confirm: z.literal(true),
    }),
    inputs: {
      password: {
        placeholder: t("password"),
        type: "password",
        hidden: !isUsingPasswordAuthentication(),
      },
      confirm: {
        type: "checkbox",
        label: options.confirmText,
      },
    },

    execFn: async ({ password }) => {
      const reauth = await reauthenticate({ password });
      if (reauth.status !== "success") {
        return {
          status: reauth.status,
          message: reauth.message,
        };
      }

      return options.action();
    },
  });
}
