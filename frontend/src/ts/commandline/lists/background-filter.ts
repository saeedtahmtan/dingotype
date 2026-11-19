import { Config } from "../../config/store";
import { setConfig } from "../../config/setters";
import { Command, CommandsSubgroup } from "../types";
import { t } from "../../i18n/store";

const subgroup: CommandsSubgroup = {
  title: t("Custom background filter..."),
  configKey: "customBackgroundFilter",
  list: [
    {
      id: "setCustomBackgroundBlur",
      display: t("blur..."),
      fa: { icon: "fa-image" },
      input: true,
      defaultValue: (): string => {
        return Config.customBackgroundFilter[0].toString();
      },
      exec: ({ input }): void => {
        if (input === undefined || input === "") return;
        const newFilters = Config.customBackgroundFilter;
        newFilters[0] = parseFloat(input);
        setConfig("customBackgroundFilter", newFilters);
      },
    },
    {
      id: "setCustomBackgroundBrightness",
      display: t("brightness..."),
      fa: { icon: "fa-image" },
      input: true,
      defaultValue: (): string => {
        return Config.customBackgroundFilter[1].toString();
      },
      exec: ({ input }): void => {
        if (input === undefined || input === "") return;
        const newFilters = Config.customBackgroundFilter;
        newFilters[1] = parseFloat(input);
        setConfig("customBackgroundFilter", newFilters);
      },
    },
    {
      id: "setCustomBackgroundSaturation",
      display: t("saturation..."),
      fa: { icon: "fa-image" },
      input: true,
      defaultValue: (): string => {
        return Config.customBackgroundFilter[2].toString();
      },
      exec: ({ input }): void => {
        if (input === undefined || input === "") return;
        const newFilters = Config.customBackgroundFilter;
        newFilters[2] = parseFloat(input);
        setConfig("customBackgroundFilter", newFilters);
      },
    },
    {
      id: "setCustomBackgroundOpacity",
      display: t("opacity..."),
      fa: { icon: "fa-image" },
      input: true,
      defaultValue: (): string => {
        return Config.customBackgroundFilter[3].toString();
      },
      exec: ({ input }): void => {
        if (input === undefined || input === "") return;
        const newFilters = Config.customBackgroundFilter;
        newFilters[3] = parseFloat(input);
        setConfig("customBackgroundFilter", newFilters);
      },
    },
  ],
};

const commands: Command[] = [
  {
    id: "setCustomBackgroundFilter",
    display: t("Custom background filter..."),
    fa: { icon: "fa-image" },
    subgroup,
  },
];

export default commands;
