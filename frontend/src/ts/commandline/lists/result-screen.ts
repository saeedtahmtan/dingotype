import * as TestLogic from "../../test/test-logic";
import { toggleResultWords } from "../../test/words-history";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../states/notifications";
import * as TestWords from "../../test/test-words";
import { Config } from "../../config/store";
import * as PractiseWords from "../../test/practise-words";
import { Command, CommandsSubgroup } from "../types";
import { getInputHistory } from "../../test/events/stats";
import { getLastEventLog, isTestFinished } from "../../states/test";
import { showModal } from "../../states/modals";
import {
  captureAndCopyToClipboard,
  captureAndDownload,
} from "../../test/screenshot";
import { t } from "../../i18n/store";

const practiceSubgroup: CommandsSubgroup = {
  title: t("Practice words..."),
  list: [
    {
      id: "practiseWordsMissed",
      display: t("missed"),
      exec: (): void => {
        PractiseWords.init("words", false);
        void TestLogic.restartTest({
          practiseMissed: true,
        });
      },
    },
    {
      id: "practiseWordsSlow",
      display: t("slow"),
      exec: (): void => {
        PractiseWords.init("off", true);
        void TestLogic.restartTest({
          practiseMissed: true,
        });
      },
    },
    {
      id: "practiseWordsBoth",
      display: t("both"),
      exec: (): void => {
        PractiseWords.init("words", true);
        void TestLogic.restartTest({
          practiseMissed: true,
        });
      },
    },
    {
      id: "practiseWordsCustom",
      display: t("custom..."),
      opensModal: true,
      exec: (): void => {
        showModal("PractiseWords");
      },
    },
  ],
};

const commands: Command[] = [
  {
    id: "nextTest",
    display: t("Next test"),
    alias: "restart start begin type test typing",
    fa: { icon: "fa-chevron-right" },
    available: (): boolean => {
      return isTestFinished();
    },
    exec: (): void => {
      void TestLogic.restartTest();
    },
  },
  {
    id: "repeatTest",
    display: t("Repeat test"),
    fa: { icon: "fa-sync-alt" },
    exec: (): void => {
      void TestLogic.restartTest({
        withSameWordset: true,
      });
    },
    available: (): boolean => {
      return isTestFinished();
    },
  },
  {
    id: "practiseWords",
    display: t("Practice words..."),
    fa: { icon: "fa-exclamation-triangle" },
    subgroup: practiceSubgroup,
    available: (): boolean => {
      return isTestFinished();
    },
  },
  {
    id: "toggleWordHistory",
    display: t("Toggle word history"),
    fa: { icon: "fa-align-left" },
    exec: (): void => {
      toggleResultWords();
    },
    available: (): boolean => {
      return isTestFinished();
    },
  },
  {
    id: "copyScreenshot",
    display: t("Copy screenshot to clipboard"),
    fa: { icon: "fa-copy" },
    alias: "copy image clipboard",
    exec: (): void => {
      setTimeout(() => {
        void captureAndCopyToClipboard();
      }, 500);
    },
    available: (): boolean => {
      return isTestFinished();
    },
  },
  {
    id: "downloadScreenshot",
    display: t("Download screenshot"),
    fa: { icon: "fa-download" },
    alias: "save image download file",
    exec: (): void => {
      setTimeout(async () => {
        void captureAndDownload();
      }, 500);
    },
    available: (): boolean => {
      return isTestFinished();
    },
  },
  {
    id: "copyWordsToClipboard",
    display: t("Copy words to clipboard"),
    fa: { icon: "fa-copy" },
    exec: (): void => {
      const eventLog = getLastEventLog();
      if (eventLog === null) {
        showErrorNotification(t("No event log found!"));
        return;
      }

      const inputHistory = getInputHistory(eventLog);
      const words =
        Config.mode === "zen"
          ? inputHistory.join("")
          : TestWords.words
              .get()
              .slice(0, inputHistory.length)
              .map((word) => word.textWithCommit)
              .join("");

      navigator.clipboard.writeText(words).then(
        () => {
          showSuccessNotification(t("Copied to clipboard"));
        },
        () => {
          showErrorNotification(t("Failed to copy!"));
        },
      );
    },
    available: (): boolean => {
      return isTestFinished();
    },
  },
];
export default commands;
