export type EnvConfig = {
  backendUrl: string;
  isDevelopment: boolean;
  clientVersion: string;
  quickLoginEmail: string | undefined;
  quickLoginPassword: string | undefined;
};

declare module "virtual:env-config" {
  export const envConfig: EnvConfig;
}
