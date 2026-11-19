import { Config } from "../../config/store";
import { getCustomTextIndicator } from "../../states/core";
import * as CustomText from "../../test/custom-text";
import { setBailedOut } from "../../states/test";
import * as TestLogic from "../../test/test-logic";
import { Command, CommandsSubgroup } from "../types";
import { t } from "../../i18n/store";

function canBailOut(): boolean {
  return (
    (Config.mode === "custom" && getCustomTextIndicator()?.isLong === true) ||
    (Config.mode === "custom" &&
      (CustomText.getLimitMode() === "word" ||
        CustomText.getLimitMode() === "section") &&
      (CustomText.getLimit().value >= 5000 ||
        CustomText.getLimit().value === 0)) ||
    (Config.mode === "custom" &&
      CustomText.getLimitMode() === "time" &&
      (CustomText.getLimitValue() >= 3600 ||
        CustomText.getLimitValue() === 0)) ||
    (Config.mode === "words" && Config.words >= 5000) ||
    Config.words === 0 ||
    (Config.mode === "time" && (Config.time >= 3600 || Config.time === 0)) ||
    Config.mode === "zen"
  );
}

const subgroup: CommandsSubgroup = {
  title: t("Are you sure..."),
  list: [
    {
      id: "bailOutNo",
      display: t("Nevermind"),
      available: (): boolean => {
        return canBailOut();
      },
    },
    {
      id: "bailOutForSure",
      display: t("Yes, I am sure"),
      exec: (): void => {
        setBailedOut(true);
        void TestLogic.finish();
      },
      available: (): boolean => {
        return canBailOut();
      },
    },
  ],
};

const commands: Command[] = [
  {
    id: "bailOut",
    display: t("Bail out..."),
    fa: { icon: "fa-running" },
    subgroup,
    visible: false,
    available: (): boolean => {
      return canBailOut();
    },
  },
];

export default commands;
