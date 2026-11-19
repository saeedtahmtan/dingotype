import type { FirebaseOptions } from "firebase/app";

/**
 * Fallback used when no firebase config file exists (offline / static hosting
 * builds). An empty key makes firebase.ts skip initialization entirely, so the
 * app never calls firebase.
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: "",
};
