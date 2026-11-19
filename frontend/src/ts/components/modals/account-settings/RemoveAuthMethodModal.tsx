import { z } from "zod";

import {
  AuthMethod,
  getAuthMethodDisplay,
  getPasswordSchema,
  hasAdditionalAuthMethods,
  isUsingPasswordAuthentication,
  removeAuthProvider,
} from "../../../auth";
import { t } from "../../../i18n/store";
import { isAuthenticated } from "../../../states/core";
import { showNoticeNotification } from "../../../states/notifications";
import { showSimpleModal } from "../../../states/simple-modal";

export function showRemoveAuthMethodModal(options: {
  authMethod: AuthMethod;
}): void {
  if (!isAuthenticated()) return;

  //check there is at least one authentication remaining
  const hasRemainingAuth = hasAdditionalAuthMethods(options.authMethod);

  if (!hasRemainingAuth) {
    showNoticeNotification(t("No remaining authentication enabled"));
    return;
  }

  const methodDisplay = getAuthMethodDisplay(options.authMethod);

  showSimpleModal({
    title: t("Remove {method} authentication", {
      method: t(methodDisplay),
    }),
    buttonText:
      options.authMethod !== "password"
        ? t("remove")
        : t("reauthenticate to remove"),
    buttonAlwaysEnabled: options.authMethod !== "password",
    schema: z.object({
      password: getPasswordSchema(),
      checked: z.literal(true),
    }),
    inputs: {
      password: {
        placeholder: t("Password"),
        type: "password",
        hidden:
          !isUsingPasswordAuthentication() || options.authMethod === "password",
      },
      checked: {
        type: "checkbox",
        label: t(
          "I understand I will lose access to my Dingotype account if my Google/GitHub account is lost or disabled.",
        ),
        hidden: options.authMethod !== "password",
      },
    },

    execFn: async ({ password }) => {
      const result = await removeAuthProvider(options.authMethod, { password });
      return result;
    },
  });
}
