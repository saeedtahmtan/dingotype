import { JSXElement } from "solid-js";

import { getAcceptedCookies, setAcceptedCookies } from "../../cookies";
import { t } from "../../i18n/store";
import { hideModal } from "../../states/modals";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { H3 } from "../common/Headers";

export function CookiesModal(): JSXElement {
  return (
    <AnimatedModal
      id="Cookies"
      modalClass="max-w-[500px]"
      wrapperClass="justify-end items-end"
      closeOnEscape={false}
      closeOnWrapperClick={false}
    >
      <H3
        text="We use cookies by the way"
        fa={{ icon: "fa-cookie-bite" }}
        class="mb-0 pb-0 text-2xl"
      />
      <div class="grid gap-4">
        <div>
          {t(
            "Dingotype keeps your settings and results in your browser only. Nothing is sent to a server.",
          )}
        </div>
        <Button
          text="accept all"
          active={true}
          onClick={() => {
            setAcceptedCookies(
              getAcceptedCookies() ?? {
                security: true,
                analytics: false,
                sentry: false,
              },
            );
            hideModal("Cookies");
          }}
        />
      </div>
    </AnimatedModal>
  );
}
