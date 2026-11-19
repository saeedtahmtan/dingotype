import { UserNameSchema } from "@monkeytype/schemas/users";
import { createSignal, For, JSXElement } from "solid-js";
import { z } from "zod";

import Ape from "../../ape";
import { refetchInboxCollection } from "../../collections/inbox";
import { quickLogin } from "../../dev/quick-login";
import { toggleCaretDebug } from "../../elements/caret";
import { useBodyClasses } from "../../hooks/useBodyClasses";
import { addXp } from "../../queries/user";
import { hideModal, showModal } from "../../states/modals";
import {
  showErrorNotification,
  showNoticeNotification,
  showSuccessNotification,
} from "../../states/notifications";
import { showSimpleModal } from "../../states/simple-modal";
import {
  isRealWordsInputShown,
  setRealWordsInputShown,
} from "../../states/test";
import { disableSlowTimerFail } from "../../test/test-timer";
import { FaSolidIcon } from "../../types/font-awesome";
import { isProfilerMode, setProfilerMode } from "../../utils/profiler-mode";
import { remoteValidation } from "../../utils/remote-validation";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { toggleFakeChartData } from "../pages/test/result/ResultChart";
import { t } from "../../i18n/store";

const [mediaQueryDebugLevel, setMediaQueryDebugLevel] = createSignal(0);

type DevButton = {
  icon: FaSolidIcon;
  label: () => string;
  onClick: () => void;
};

export function DevOptionsModal(): JSXElement {
  useBodyClasses(() => ({
    mediaQueryDebugLevel1: mediaQueryDebugLevel() === 1,
    mediaQueryDebugLevel2: mediaQueryDebugLevel() === 2,
  }));

  const buttons: DevButton[] = [
    {
      icon: "fa-database",
      label: () => t("Generate Data"),
      onClick: () => showGenerateDataModal(),
    },
    {
      icon: "fa-bell",
      label: () => t("Test Notifications"),
      onClick: () => {
        showSuccessNotification(t("This is a test"), { durationMs: 0 });
        showNoticeNotification(t("This is a test"), { durationMs: 0 });
        showErrorNotification(t("This is a test"), {
          durationMs: 0,
          details: { test: true, error: "Example error message" },
        });
        showNoticeNotification(t("useInnerHtml<br>test"), {
          durationMs: 0,
          useInnerHtml: true,
        });
        hideModal("DevOptions");
      },
    },
    {
      icon: "fa-ruler",
      label: () => t("Media Query Debug ({level})", { level: mediaQueryDebugLevel() }),
      onClick: () => {
        const next =
          mediaQueryDebugLevel() >= 2 ? 0 : mediaQueryDebugLevel() + 1;
        setMediaQueryDebugLevel(next);
        showNoticeNotification(t("Setting media query debug level to {level}", { level: next }));
      },
    },
    {
      icon: "fa-eye",
      label: () =>
        t("{action} Real Words Input", {
          action: isRealWordsInputShown() ? t("Hide") : t("Show"),
        }),
      onClick: () => {
        setRealWordsInputShown((shown) => !shown);
        hideModal("DevOptions");
      },
    },
    {
      icon: "fa-sign-in-alt",
      label: () => t("Quick Login"),
      onClick: () => {
        void quickLogin();
        hideModal("DevOptions");
      },
    },
    {
      icon: "fa-star",
      label: () => t("XP Simple Test"),
      onClick: () => {
        setTimeout(() => {
          addXp(1000);
        }, 500);
        hideModal("DevOptions");
      },
    },
    {
      icon: "fa-star",
      label: () => t("XP with breakdown Test"),
      onClick: () => {
        setTimeout(() => {
          const fakeBreakdown = {
            base: 100,
            quote: 10,
            corrected: 5,
            funbox: 5,
            streak: 10,
            incomplete: 10,
            accPenalty: 5,
            configMultiplier: 2,
            daily: 10000,
          };
          const totalFakeXp = 10270;
          addXp(totalFakeXp, fakeBreakdown);
        }, 500);
        hideModal("DevOptions");
      },
    },
    {
      icon: "fa-inbox",
      label: () => t("Add Debug Inbox Item"),
      onClick: () => {
        showModal("DevInboxPicker");
      },
    },
    {
      icon: "fa-chart-bar",
      label: () => t("Toggle Fake Chart Data"),
      onClick: toggleFakeChartData,
    },
    {
      icon: "fa-i-cursor",
      label: () => t("Toggle Caret Debug"),
      onClick: toggleCaretDebug,
    },
    {
      icon: "fa-clock",
      label: () => t("Disable Slow Timer Fail"),
      onClick: disableSlowTimerFail,
    },
    {
      icon: "fa-vials",
      label: () => t("Event Log Viewer"),
      onClick: () => showModal("EventLogViewer"),
    },
    {
      icon: "fa-stopwatch",
      label: () =>
        t("Profiler Mode ({state})", {
          state: isProfilerMode() ? t("ON") : t("OFF"),
        }),
      onClick: () => {
        setProfilerMode(!isProfilerMode());
        showNoticeNotification(t("Profiler mode toggled, reloading..."));
        setTimeout(() => location.reload(), 500);
      },
    },
  ];

  const addDebugInboxItem = (rewardType: "xp" | "badge" | "none"): void => {
    hideModal("DevInboxPicker");
    void Ape.dev
      .addDebugInboxItem({ body: { rewardType } })
      .then((response) => {
        if (response.status !== 200) {
          showErrorNotification(t("Failed to add inbox item"), {
            details: response.body,
          });
          return;
        }
        showSuccessNotification(t("Debug inbox item added"));
        void refetchInboxCollection();
      });
  };

  return (
    <>
      <AnimatedModal id="DevOptions" title={t("Dev Options")}>
        <div class="flex flex-col gap-4">
          <For each={buttons}>
            {(btn) => (
              <Button
                variant="button"
                onClick={btn.onClick}
                fa={{ icon: btn.icon, fixedWidth: true }}
                text={btn.label()}
              />
            )}
          </For>
        </div>
      </AnimatedModal>
      <AnimatedModal id="DevInboxPicker" title={t("Choose Reward Type")}>
        <div class="flex flex-col gap-4">
          <Button
            variant="button"
            onClick={() => addDebugInboxItem("xp")}
            fa={{ icon: "fa-star", fixedWidth: true }}
            text="XP Reward (1000)"
          />
          <Button
            variant="button"
            onClick={() => addDebugInboxItem("badge")}
            fa={{ icon: "fa-certificate", fixedWidth: true }}
            text="Badge Reward"
          />
          <Button
            variant="button"
            onClick={() => addDebugInboxItem("none")}
            fa={{ icon: "fa-envelope", fixedWidth: true }}
            text="No Reward"
          />
        </div>
      </AnimatedModal>
    </>
  );
}

function showGenerateDataModal(): void {
  showSimpleModal({
    title: t("Generate data"),
    text: t("if create user is checked, user will be created with <name>@example.com and password: password"),
    class: "max-w-2xl",
    schema: z.object({
      username: UserNameSchema,
      createUser: z.boolean(),
      firstTestTimestamp: z.date().max(new Date()).optional(),
      lastTestTimestamp: z.date().max(new Date()).optional(),
      minTestsPerDay: z.number().safe().int().min(0).max(200),
      maxTestsPerDay: z.number().safe().int().min(0).max(200),
    }),
    inputs: {
      createUser: {
        type: "checkbox",
        label: t("create user"),
        initVal: false,
        description:
          t("if checked, user will be created with {username}@example.com and password: password"),
      },
      username: {
        type: "text",
        label: t("username"),
        placeholder: t("username"),
        validation: {
          isValid: remoteValidation(
            async (name: string) =>
              Ape.users.getNameAvailability({ params: { name } }),
            { check: (data) => !data.available || t("Unknown user") },
          ),
          debounceDelay: 1000,
        },
      },
      firstTestTimestamp: {
        type: "date",
        label: t("first test"),
      },
      lastTestTimestamp: {
        type: "date",
        label: t("last test"),
      },
      minTestsPerDay: {
        type: "range",
        label: t("min tests per day"),
        initVal: 0,
        step: 10,
      },
      maxTestsPerDay: {
        type: "range",
        label: t("max tests per day"),
        initVal: 50,

        step: 10,
      },
    },
    buttonText: t("generate (might take a while)"),
    execFn: async ({
      username,
      createUser,
      firstTestTimestamp,
      lastTestTimestamp,
      minTestsPerDay,
      maxTestsPerDay,
    }) => {
      const result = await Ape.dev.generateData({
        body: {
          username,
          createUser,
          firstTestTimestamp: firstTestTimestamp?.getTime(),
          lastTestTimestamp: lastTestTimestamp?.getTime(),
          minTestsPerDay,
          maxTestsPerDay,
        },
      });

      return {
        status: result.status === 200 ? "success" : "error",
        message: result.body.message,
      };
    },
  });
}
