import {
  LeaderboardEntry,
  XpLeaderboardEntry,
} from "@monkeytype/schemas/leaderboards";
import { formatDuration, intervalToDuration } from "date-fns";
import { JSXElement, Match, Show, Switch } from "solid-js";

import { t } from "../../../i18n/store";
import { getFormatting } from "../../../states/core";
import { Fa } from "../../common/Fa";
import { LoadingCircle } from "../../common/LoadingCircle";
import { Table, TableEntry } from "./Table";

export function UserRank(props: {
  type: "speed" | "xp";
  data?: LeaderboardEntry | XpLeaderboardEntry | null;
  minWpm?: number;
  friendsOnly: boolean;
  total: number | undefined;
  memoryDifference: number | undefined;
  isLbOptOut: boolean;
  isBanned: boolean;
  minTimeTyping: number;
  userTimeTyping: number;
}): JSXElement {
  const format = getFormatting;

  const userOverride = () => {
    if (props.data === undefined || props.data === null) {
      return "";
    }
    const rank = props.friendsOnly
      ? (props.data.friendsRank as number)
      : props.data.rank;
    const percentile = (rank / (props.total ?? 1)) * 100;

    let percentileString = t("Top {percent}%", {
      percent: percentile.toFixed(2),
    });
    if (rank === 1) {
      percentileString = t("GOAT");
    }

    return (
      <div class="text-[1em]">
        <div>{t("You ({percentile})", { percentile: percentileString })}</div>
        <div class="hidden text-em-xs text-sub sm:block sm:text-em-sm">
          {" "}
          <Show when={props.memoryDifference !== undefined}>
            ({" "}
            <Switch>
              <Match when={props.memoryDifference === 0}>=</Match>
              <Match when={(props.memoryDifference as number) > 0}>
                <>
                  <Fa icon="fa-angle-up" fixedWidth />
                  {Math.abs(props.memoryDifference as number)}
                </>
              </Match>
              <Match when={(props.memoryDifference as number) < 0}>
                <>
                  <Fa icon="fa-angle-down" fixedWidth />
                  {Math.abs(props.memoryDifference as number)}
                </>
              </Match>
            </Switch>{" "}
            {t("since you last checked")})
          </Show>
        </div>
      </div>
    );
  };

  return (
    <div class="flex h-18 rounded bg-sub-alt">
      <Show
        when={props.data !== undefined && props.total !== undefined}
        fallback={<LoadingCircle class="w-full text-center text-2xl" />}
      >
        <Show
          when={props.data !== null}
          fallback={
            <div class="grid w-full place-items-center p-4 text-center text-sub">
              <Switch fallback={t("Not qualified")}>
                <Match when={props.isLbOptOut}>
                  <div>{t("You have opted out of the leaderboards.")}</div>
                </Match>
                <Match when={props.isBanned}>
                  <div>{t("Your account is banned.")}</div>
                </Match>
                <Match when={props.userTimeTyping < props.minTimeTyping}>
                  <div>
                    {t(
                      "Your account must have {duration} typed to be placed on the leaderboard.",
                      {
                        duration: formatDuration(
                          intervalToDuration({
                            start: 0,
                            end: props.minTimeTyping * 1000,
                          }),
                        ),
                      },
                    )}
                  </div>
                </Match>
                <Match when={props.minWpm !== undefined}>
                  <div>
                    {t("Not qualified (min speed required: {speed})", {
                      speed: format().typingSpeed(props.minWpm, {
                        showDecimalPlaces: true,
                        suffix: ` ${format().typingSpeedUnit}`,
                      }),
                    })}
                  </div>
                </Match>
              </Switch>
            </div>
          }
        >
          <Table
            type={props.type}
            entries={[props.data as TableEntry]}
            friendsOnly={props.friendsOnly}
            userOverride={userOverride}
            hideHeader={true}
          />
        </Show>
      </Show>
    </div>
  );
}
