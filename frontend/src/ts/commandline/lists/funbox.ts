import * as Funbox from "../../test/funbox/funbox";
import * as TestLogic from "../../test/test-logic";
import { getAllFunboxes, checkCompatibility } from "@monkeytype/funbox";
import { Command, CommandsSubgroup } from "../types";
import { getActiveFunboxNames } from "../../test/funbox/list";
import { t } from "../../i18n/store";

const list: Command[] = [
  {
    id: "changeFunboxNone",
    display: t("none"),
    configValue: "none",
    alias: "off",
    sticky: true,
    exec: (): void => {
      if (Funbox.setFunbox([])) {
        void TestLogic.restartTest();
      }
    },
  },
];

for (const funbox of getAllFunboxes()) {
  list.push({
    id: `changeFunbox${funbox.name}`,
    display: funbox.name.replace(/_/g, " "),
    available: () => {
      const activeNames = getActiveFunboxNames();
      if (activeNames.includes(funbox.name)) return true;
      return checkCompatibility(activeNames, funbox.name);
    },
    sticky: true,
    alias: funbox.alias,
    configValue: funbox.name,
    configValueMode: "include",
    exec: (): void => {
      Funbox.toggleFunbox(funbox.name);
      void TestLogic.restartTest();
    },
  });
}

const subgroup: CommandsSubgroup = {
  title: t("Funbox..."),
  configKey: "funbox",
  list,
};

const commands: Command[] = [
  {
    id: "changeFunbox",
    display: t("Funbox..."),
    alias: "fun box",
    fa: { icon: "fa-gamepad" },
    subgroup,
  },
];

export default commands;
