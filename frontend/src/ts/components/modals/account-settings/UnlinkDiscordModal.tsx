import { t } from "../../../i18n/store";
import { unlinkDiscord } from "../../../queries/user";
import { showSimpleModal } from "../../../states/simple-modal";

export function showUnlinkDiscordModal(): void {
  showSimpleModal({
    title: t("Unlink Discord"),
    text: t("Are you sure you want to unlink your Discord account?"),
    buttonText: t("unlink"),
    execFn: async () => {
      const { error } = await unlinkDiscord();
      if (error !== null) {
        return {
          status: "error",
          message: t("Failed to unlink Discord"),
          notificationOptions: { error },
        };
      }

      return {
        status: "success",
        message: t("Discord unlinked"),
      };
    },
  });
}
