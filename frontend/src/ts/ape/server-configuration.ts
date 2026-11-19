import { Configuration } from "@monkeytype/schemas/configuration";
import { promiseWithResolvers } from "../utils/misc";
import { queryClient } from "../queries";
import { getServerConfigurationQueryOptions } from "../queries/server-configuration";
import { isStaticMode } from "../utils/env";

const {
  promise: configurationPromise,
  resolve,
  reject,
} = promiseWithResolvers<boolean>();

export { configurationPromise };

export function get(): Configuration | undefined {
  return queryClient.getQueryData(
    getServerConfigurationQueryOptions().queryKey,
  );
}

export async function sync(): Promise<void> {
  // static mode: no backend to ask, callers fall back to defaults
  if (isStaticMode()) {
    resolve(true);
    return;
  }
  try {
    await queryClient.query(getServerConfigurationQueryOptions());
    resolve(true);
  } catch (e) {
    reject(e);
  }
}
