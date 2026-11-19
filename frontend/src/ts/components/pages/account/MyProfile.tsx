import { JSXElement, Show } from "solid-js";

import { t } from "../../../i18n/store";
import { getUserData } from "../../../queries/user";
import { UserProfile } from "../profile/UserProfile";

export function MyProfile(): JSXElement {
  return (
    <Show
      when={getUserData()}
      fallback={t("Offline — showing results saved in this browser")}
    >
      {(p) => <UserProfile profile={p()} isAccountPage />}
    </Show>
  );
}
