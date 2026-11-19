import { getChallenges } from "@monkeytype/challenges";
import * as ChallengeController from "../../controllers/challenge-controller";
import { navigate } from "../../router/navigate";
import * as TestLogic from "../../test/test-logic";
import { capitalizeFirstLetterOfEachWord } from "../../utils/strings";
import { Command, CommandsSubgroup } from "../types";
import { t } from "../../i18n/store";

const subgroup: CommandsSubgroup = {
  title: t("Load challenge..."),
  list: getChallenges()
    .filter((it) => it.settings !== undefined)
    .map((challenge) => ({
      id: `loadChallenge${capitalizeFirstLetterOfEachWord(challenge.name)}`,
      display: challenge.display,
      exec: async (): Promise<void> => {
        await navigate({ to: "/" });
        await ChallengeController.setup(challenge.name);
        void TestLogic.restartTest({
          nosave: true,
        });
      },
    })),
};

const commands: Command[] = [
  {
    id: "loadChallenge",
    display: t("Load challenge..."),
    fa: { icon: "fa-award" },
    subgroup,
  },
];

export default commands;
