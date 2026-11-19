import {
  Analytics as AnalyticsType,
  logEvent,
  setAnalyticsCollectionEnabled,
} from "firebase/analytics";
import { getAnalytics } from "../firebase";
import { createErrorMessage } from "../utils/error";

let analytics: AnalyticsType;

export async function log(
  eventName: string,
  params?: Record<string, string>,
): Promise<void> {
  // offline/no account builds have no firebase: silently skip telemetry
  if (analytics === undefined) return;
  try {
    logEvent(analytics, eventName, params);
  } catch {
    // ignore telemetry failures
  }
}

export function activateAnalytics(): void {
  if (analytics !== undefined) return;
  try {
    const firebaseAnalytics = getAnalytics();
    if (firebaseAnalytics === undefined) return;
    analytics = firebaseAnalytics;
    setAnalyticsCollectionEnabled(analytics, true);
    document.body.insertAdjacentHTML(
      "beforeend",
      `
    <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=UA-165993088-1"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "UA-165993088-1");
  </script>`,
    );
  } catch (e) {
    console.error(createErrorMessage(e, "Failed to activate analytics"));
  }
}
