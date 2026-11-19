import { Plugin } from "vite";
import { EnvConfig } from "virtual:env-config";

const virtualModuleId = "virtual:env-config";
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

export function envConfig(options: {
  isDevelopment: boolean;
  clientVersion: string;
  env: Record<string, string>;
}): Plugin {
  return {
    name: "virtual-env-config",
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
      return undefined;
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // an explicit empty BACKEND_URL means static mode (no backend at all),
        // so only an undefined value falls back to the default
        const devConfig: EnvConfig = {
          isDevelopment: true,
          backendUrl: options.env["BACKEND_URL"] ?? "http://localhost:5005",
          clientVersion: options.clientVersion,
          quickLoginEmail: options.env["QUICK_LOGIN_EMAIL"],
          quickLoginPassword: options.env["QUICK_LOGIN_PASSWORD"],
        };

        const prodConfig: EnvConfig = {
          isDevelopment: false,
          backendUrl:
            options.env["BACKEND_URL"] ?? "https://api.monkeytype.com",
          clientVersion: options.clientVersion,
          quickLoginEmail: undefined,
          quickLoginPassword: undefined,
        };

        const envConfig = options.isDevelopment ? devConfig : prodConfig;
        return `
          export const envConfig = ${JSON.stringify(envConfig)};
        `;
      }
      return undefined;
    },
  };
}
