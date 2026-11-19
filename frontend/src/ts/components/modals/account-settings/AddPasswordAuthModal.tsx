import { UserEmailSchema } from "@monkeytype/schemas/users";
import { z } from "zod";

import { addAuthProvider, getPasswordSchema } from "../../../auth";
import { t } from "../../../i18n/store";
import { showSimpleModal } from "../../../states/simple-modal";

export function showAddPasswordAuthModal(): void {
  showSimpleModal({
    title: t("Add password authentication"),
    buttonText: t("reauthenticate to add"),
    schema: z.object({
      email: UserEmailSchema,
      emailConfirm: UserEmailSchema,
      password: getPasswordSchema({ isNew: true }),
      passConfirm: getPasswordSchema({ isNew: true }),
    }),
    inputs: {
      email: {
        placeholder: t("email"),
        type: "email",
      },
      emailConfirm: {
        placeholder: t("confirm email"),
        type: "email",
      },
      password: {
        placeholder: t("new password"),
        type: "password",
      },
      passConfirm: {
        placeholder: t("confirm new password"),
        type: "password",
      },
    },

    execFn: async ({ email, emailConfirm, password, passConfirm }) => {
      if (email !== emailConfirm) {
        return {
          status: "notice",
          message: t("Emails don't match"),
        };
      }

      if (password !== passConfirm) {
        return {
          status: "notice",
          message: t("Passwords don't match"),
        };
      }

      await addAuthProvider({ authMethod: "password", email, password });

      return {
        status: "success",
        showNotification: false,
      };
    },
  });
}
