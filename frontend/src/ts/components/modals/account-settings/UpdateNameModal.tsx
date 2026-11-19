import { UserNameSchema } from "@monkeytype/schemas/users";
import { z } from "zod";

import Ape from "../../../ape";
import {
  getPasswordSchema,
  isUsingPasswordAuthentication,
  reauthenticate,
} from "../../../auth";
import { t } from "../../../i18n/store";
import { updateName, getUserData } from "../../../queries/user";
import { isAuthenticated } from "../../../states/core";
import { showSimpleModal } from "../../../states/simple-modal";
import { remoteValidation } from "../../../utils/remote-validation";

export function showUpdateNameModal(): void {
  const userData = getUserData();
  if (!isAuthenticated() || !userData) return;

  showSimpleModal({
    title: t("Update name"),
    buttonText: isUsingPasswordAuthentication()
      ? t("update")
      : t("reauthenticate to update"),
    text: userData.needsToChangeName
      ? t(
          "You need to change your account name. This might be because you have a duplicate name, no account name or your name is not allowed (contains whitespace or invalid characters). Sorry for the inconvenience.",
        )
      : undefined,
    schema: z.object({
      password: getPasswordSchema(),
      newName: UserNameSchema,
    }),
    inputs: {
      password: {
        placeholder: t("password"),
        type: "password",
        hidden: !isUsingPasswordAuthentication(),
      },
      newName: {
        placeholder: t("new name"),
        type: "text",
        validation: {
          isValid: remoteValidation(
            async (name: string) =>
              Ape.users.getNameAvailability({ params: { name } }),
            { check: (data) => data.available || t("Name not available") },
          ),
          debounceDelay: 1000,
        },
      },
    },

    execFn: async ({ password, newName }) => {
      const reauth = await reauthenticate({ password });
      if (reauth.status !== "success") {
        return {
          status: reauth.status,
          message: reauth.message,
        };
      }

      const { error } = await updateName(newName);
      if (error !== null) {
        return {
          status: "error",
          message: t("Failed to update name"),
          notificationOptions: { error },
        };
      }

      return {
        status: "success",
        message: t("Name updated"),
      };
    },
  });
}
