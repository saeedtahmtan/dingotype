import { AnyFieldApi } from "@tanstack/solid-form";
import { Accessor, JSXElement } from "solid-js";

/**
 * Accounts are not available in this offline build, so there is no captcha
 * provider. Kept as a placeholder so the registration form still renders.
 */
export function Captcha(_props: {
  field: Accessor<AnyFieldApi>;
  class?: string;
  onSuccess?: (responseToken: string) => void;
}): JSXElement {
  return <div class={_props.class}>Registration is disabled.</div>;
}
