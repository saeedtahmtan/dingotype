import { createMemo, JSXElement, Show } from "solid-js";

import { getConfig } from "../../../../config/store";
import { t } from "../../../../i18n/store";
import { getFormatting } from "../../../../states/core";
import { CrownType, resultState } from "../../../../states/result";
import { CompletedResult } from "../../../../states/test";
import { getAccuracy } from "../../../../test/events/stats";
import { EventLog } from "../../../../test/events/types";
import { isFunboxActive } from "../../../../test/funbox/active";
import {
  getTranslationTestLanguage,
  translationSession,
} from "../../../../test/translation";
import { cn } from "../../../../utils/cn";
import { AnimeShow } from "../../../common/anime";
import { Balloon } from "../../../common/Balloon";
import { Fa } from "../../../common/Fa";
import { speedBalloon } from "./speed-balloon";

type Props = {
  result: CompletedResult;
  eventLog: EventLog;
};

export function ResultMainStats(props: Props): JSXElement {
  const format = () => getFormatting();
  const decimals = () => getConfig.alwaysShowDecimalPlaces;
  const unit = () => getConfig.typingSpeedUnit;

  const speedText = (wpm: number): string =>
    wpm >= 1000 ? "Infinite" : format().typingSpeed(wpm);

  const accCounts = createMemo(() => getAccuracy(props.eventLog));

  const translationActive = (): boolean => isFunboxActive("translation");
  const translationScore = () =>
    translationSession()[getTranslationTestLanguage()];

  const accBalloon = (): string | undefined => {
    const counts = accCounts();
    const countsText = `${counts.correct} correct\n${counts.incorrect} incorrect`;
    if (decimals()) return countsText;
    const acc =
      props.result.acc === 100
        ? "100%"
        : format().percentage(props.result.acc, { showDecimalPlaces: true });
    return `${acc}\n${countsText}`;
  };

  return (
    <div
      class={cn(
        "grid items-center justify-center gap-2",
        "sm:grid-cols-2 sm:justify-items-center",
        "md:grid-cols-1 md:justify-items-start",
      )}
    >
      <Show
        when={translationActive()}
        fallback={
          <div class="text-[2rem]" data-ui-element="resultStat">
            <div class="flex items-center leading-[0.5em] text-sub">
              <div>{unit()}</div>
              <Crown />
            </div>
            <Balloon
              data-ui-element="resultStatValue"
              class="text-[2em] text-main"
              text={speedBalloon(props.result.wpm)}
            >
              {speedText(props.result.wpm)}
            </Balloon>
          </div>
        }
      >
        <div class="text-[2rem]" data-ui-element="resultStat">
          <div class="flex items-center leading-[0.5em] text-sub">
            <div>{t("tra")}</div>
            <Crown />
            <span class="ml-2 text-xs">{getTranslationTestLanguage()}</span>
          </div>
          <Balloon
            data-ui-element="resultStatValue"
            class="text-[2em] text-main"
            text={`${translationScore().score} points\n+${translationScore().correct} correct\n-${translationScore().wrong} wrong`}
          >
            {translationScore().score}
          </Balloon>
          <div class="text-xs text-sub">
            +{translationScore().correct} / -{translationScore().wrong}
          </div>
        </div>
      </Show>
      <div class="text-[2rem]" data-ui-element="resultStat">
        <div class="leading-[0.5em] text-sub">{t("acc")}</div>
        <Balloon
          data-ui-element="resultStatValue"
          class="text-[2em] text-main"
          text={accBalloon()}
          break
        >
          {props.result.acc === 100
            ? "100%"
            : format().accuracy(props.result.acc)}
        </Balloon>
      </div>
    </div>
  );
}

const crownColors: Record<CrownType, string> = {
  normal: "bg-main text-bg",
  pending: "bg-bg text-main outline-[0.2em] outline-main",
  ineligible: "bg-sub text-bg",
  error: "bg-error text-bg",
  warning: "bg-sub text-bg",
};

function Crown(): JSXElement {
  const type = (): CrownType => resultState.crown.type;
  return (
    <AnimeShow when={resultState.crown.visible}>
      <Balloon
        class={cn(
          "grid h-[1.7rem] w-[1.7rem] items-center justify-items-center rounded text-[0.7rem] transition-[opacity,background,color,outline]",
          "[grid-template-areas:'icon'] *:[grid-area:icon]",
          "my-[-0.85rem] ml-2",
          crownColors[type()],
        )}
        text={resultState.crown.text}
        length={resultState.crown.wide ? "medium" : undefined}
      >
        <Fa
          icon="fa-question"
          class={cn("opacity-0", { "opacity-100": type() === "error" })}
        />
        <Fa
          icon="fa-crown"
          class={
            type() === "error" || type() === "warning" ? "opacity-0" : undefined
          }
        />
        <Fa
          icon="fa-slash"
          class={cn("text-[1.2rem] text-sub opacity-0", {
            "opacity-100": type() === "ineligible",
          })}
        />
        <Fa
          icon="fa-exclamation-triangle"
          class={cn("opacity-0", { "opacity-100": type() === "warning" })}
        />
      </Balloon>
    </AnimeShow>
  );
}
