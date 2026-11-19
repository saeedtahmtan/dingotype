import { Config } from "../../config/store";
import { setConfig } from "../../config/setters";
import { get as getTypingSpeedUnit } from "../../utils/typing-speed-units";
import { Command, CommandsSubgroup } from "../types";
import { t } from "../../i18n/store";

const subgroup: CommandsSubgroup = {
  title: t("Min word burst..."),
  configKey: "minBurst",
  list: [
    {
      id: "setMinBurstOff",
      display: t("off"),
      configValue: "off",
      exec: (): void => {
        setConfig("minBurst", "off");
      },
    },
    {
      id: "setMinBurstFixed",
      display: t("fixed..."),
      configValue: "fixed",
      input: true,
      exec: ({ input }): void => {
        if (input === undefined || input === "") return;
        setConfig("minBurst", "fixed");
        const newVal = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
          parseInt(input),
        );
        setConfig("minBurstCustomSpeed", newVal);
      },
    },
    {
      id: "setMinBurstFlex",
      display: t("flex..."),
      configValue: "flex",
      input: true,
      exec: ({ input }): void => {
        if (input === undefined || input === "") return;
        setConfig("minBurst", "flex");
        const newVal = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
          parseInt(input),
        );
        setConfig("minBurstCustomSpeed", newVal);
      },
    },
  ],
};

const commands: Command[] = [
  {
    id: "changeMinBurst",
    display: t("Min word burst..."),
    alias: "minimum",
    fa: { icon: "fa-bomb" },
    subgroup,
  },
];

export default commands;
