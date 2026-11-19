import { TagNameSchema } from "@monkeytype/schemas/users";
import { z } from "zod";

import { insertTag } from "../../queries/tags";
import { showSimpleModal } from "../../states/simple-modal";
import { normalizeName } from "../../utils/strings";
import { t } from "../../i18n/store";

export function showAddTagModal(): void {
  showSimpleModal({
    title: t("Add new tag"),
    buttonText: t("add"),
    schema: z.object({
      tagName: TagNameSchema,
    }),
    inputs: {
      tagName: {
        type: "text",
        placeholder: t("tag name"),
        preprocess: normalizeName,
      },
    },
    execFn: async ({ tagName }) => {
      const { error } = await insertTag(tagName);
      if (error !== null) {
        return {
          status: "error",
          message: t("Failed to add tag"),
          notificationOptions: { error },
        };
      }

      return {
        status: "success",
        message: t("Tag added"),
      };
    },
  });
}
