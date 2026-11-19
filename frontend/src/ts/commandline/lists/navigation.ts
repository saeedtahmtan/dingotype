import { navigate } from "../../router/navigate";
import { isAuthenticated } from "../../states/core";
import { toggleFullscreen } from "../../utils/misc";
import { Command, withValidation } from "../types";
import { remoteValidation } from "../../utils/remote-validation";
import { UserNameWithoutFilterSchema } from "@monkeytype/schemas/users";
import Ape from "../../ape";
import { t } from "../../i18n/store";

const commands: Command[] = [
  {
    id: "viewTypingPage",
    display: t("View Typing Page"),
    alias: "navigate go to start begin type test",
    fa: { icon: "fa-keyboard" },
    exec: (): void => {
      void navigate({ to: "/" });
    },
  },
  {
    id: "viewLeaderboards",
    display: t("View Leaderboards"),
    alias: "navigate go to",
    fa: { icon: "fa-crown" },
    exec: (): void => {
      void navigate({ to: "/leaderboards" });
    },
  },
  {
    id: "viewAbout",
    display: t("View About Page"),
    alias: "navigate go to",
    fa: { icon: "fa-info" },
    exec: (): void => {
      void navigate({ to: "/about" });
    },
  },
  {
    id: "viewSettings",
    display: t("View Settings Page"),
    alias: "navigate go to",
    fa: { icon: "fa-cog" },
    exec: (): void => {
      void navigate({ to: "/settings" });
    },
  },

  {
    id: "viewAccount",
    display: t("View Account Page"),
    alias: "navigate go to stats",
    fa: { icon: "fa-user" },
    exec: (): void => {
      void navigate({ to: isAuthenticated() ? "/account" : "/login" });
    },
  },
  withValidation({
    id: "searchProfile",
    display: t("Search for a profile"),
    alias: "profile user search find lookup",
    fa: { icon: "fa-search" },
    input: true,
    validation: {
      schema: UserNameWithoutFilterSchema,
      debounceDelay: 1000,
      isValid: remoteValidation(
        async (name) => Ape.users.getProfile({ params: { uidOrName: name } }),
        {
          on4xx: () => t("Unknown user"),
        },
      ),
    },
    exec: ({ input }): void => {
      if (input === undefined) return;
      void navigate({
        to: "/profile/$uidOrName",
        params: { uidOrName: input },
      });
    },
  }),
  {
    id: "toggleFullscreen",
    display: t("Toggle Fullscreen"),
    fa: { icon: "fa-expand" },
    exec: (): void => {
      toggleFullscreen();
    },
  },
];

export default commands;
