import { ThemeName } from "@monkeytype/schemas/configs";
import { Config } from "../../config/store";
import { setConfig } from "../../config/setters";
import { getRandomTheme } from "../../states/theme";
import { Command } from "../types";
import { t } from "../../i18n/store";

const getCurrentTheme = (): ThemeName =>
  (getRandomTheme()?.name as ThemeName | undefined) ?? Config.theme;

const commands: Command[] = [
  {
    id: "addThemeToFavorite",
    display: t("Add current theme to favorite"),
    fa: { icon: "fa-star" },
    available: (): boolean => {
      return (
        !Config.customTheme && !Config.favThemes.includes(getCurrentTheme())
      );
    },
    exec: (): void => {
      const { favThemes, customTheme } = Config;
      const themeToUpdate = getCurrentTheme();
      if (!customTheme && !favThemes.includes(themeToUpdate)) {
        setConfig("favThemes", [...favThemes, themeToUpdate]);
      }
    },
  },
  {
    id: "removeThemeFromFavorite",
    display: t("Remove current theme from favorite"),
    fa: { icon: "fa-star", variant: "regular" },
    available: (): boolean => {
      return (
        !Config.customTheme && Config.favThemes.includes(getCurrentTheme())
      );
    },
    exec: (): void => {
      const { favThemes, customTheme } = Config;
      const themeToUpdate = getCurrentTheme();
      if (!customTheme && favThemes.includes(themeToUpdate)) {
        setConfig("favThemes", [
          ...favThemes.filter((t) => t !== themeToUpdate),
        ]);
      }
    },
  },
];

export default commands;
