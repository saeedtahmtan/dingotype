import { envConfig } from "virtual:env-config";

export function isDevEnvironment(): boolean {
  return envConfig.isDevelopment;
}

/** No backend: static hosting builds, everything runs in the browser. */
export function isStaticMode(): boolean {
  return envConfig.backendUrl === "";
}

/** Resolves a root-relative path against the deployed base (eg. /dingotype/). */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}
