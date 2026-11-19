import { createSignal } from "solid-js";

import { fa } from "./fa";

export type UiLanguage = "en" | "fa";

const STORAGE_KEY = "uiLanguage";

function loadUiLanguage(): UiLanguage {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fa";
  } catch {
    return "fa";
  }
}

const [uiLanguage, setUiLanguageSignal] =
  createSignal<UiLanguage>(loadUiLanguage());

document.documentElement.lang = uiLanguage();

export { uiLanguage };

export function setUiLanguage(language: UiLanguage): void {
  setUiLanguageSignal(language);
  document.documentElement.lang = language;
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // storage blocked: the choice lasts for this session
  }
}

function interpolate(
  text: string,
  values: Record<string, string | number> | undefined,
): string {
  if (values === undefined) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] === undefined ? match : String(values[key]),
  );
}

/**
 * Translates an English UI string. English itself is the key, so anything not
 * translated yet falls back to English instead of showing a placeholder.
 */
export function t(
  text: string,
  values?: Record<string, string | number>,
): string {
  if (uiLanguage() === "en") return interpolate(text, values);
  return interpolate(fa[text] ?? text, values);
}
