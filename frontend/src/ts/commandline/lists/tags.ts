import {
  getTags,
  isTagActive,
  setActiveTags,
  toggleTagActive,
} from "../../queries/tags";
import { Config } from "../../config/store";
import * as PaceCaret from "../../test/pace-caret";
import { isAuthenticated } from "../../states/core";
import { Command, CommandsSubgroup } from "../types";
import { showAddTagModal } from "../../components/modals/AddTagModal";
import { t } from "../../i18n/store";

const subgroup: CommandsSubgroup = {
  title: t("Tags..."),
  list: [],
  beforeList: (): void => {
    update();
  },
};

const commands: Command[] = [
  {
    id: "changeTags",
    display: t("Tags..."),
    fa: { icon: "fa-tag" },
    subgroup,
    available: (): boolean => {
      return isAuthenticated();
    },
  },
];

function update(): void {
  const tags = getTags();
  subgroup.list = [];

  if (tags.length > 0) {
    subgroup.list.push({
      id: "clearTags",
      display: t("Clear tags"),
      fa: { icon: "fa-times" },
      sticky: true,
      exec: async (): Promise<void> => {
        setActiveTags([]);
        if (
          Config.paceCaret === "average" ||
          Config.paceCaret === "tagPb" ||
          Config.paceCaret === "daily"
        ) {
          await PaceCaret.init();
        }
      },
    });

    for (const tag of tags) {
      subgroup.list.push({
        id: `toggleTag${tag._id}`,
        display: tag.name,
        sticky: true,
        active: () => {
          return isTagActive(tag._id);
        },
        exec: async (): Promise<void> => {
          toggleTagActive(tag._id);

          if (
            Config.paceCaret === "average" ||
            Config.paceCaret === "tagPb" ||
            Config.paceCaret === "daily"
          ) {
            await PaceCaret.init();
          }
        },
      });
    }
  }
  subgroup.list.push({
    id: "createTag",
    display: t("Create tag"),
    fa: { icon: "fa-plus" },
    shouldFocusTestUI: false,
    opensModal: true,
    exec: (): void => {
      showAddTagModal();
    },
  });
}

export default commands;
