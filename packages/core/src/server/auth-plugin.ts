import { getMethod, setResponseStatus } from "h3";

import { autoMountAuth } from "./auth.js";
import { getSession } from "./auth.js";
import type { AuthOptions } from "./auth.js";
import { runBetterAuthMigrations } from "./better-auth-migrations.js";
import {
  FRAMEWORK_AUTH_EARLY_PATHS,
  awaitBootstrap,
  getH3App,
  markDefaultPluginProvided,
  markFrameworkRoutesReadyBeforeBootstrap,
  trackPluginInit,
} from "./framework-request-handler.js";

type NitroPluginDef = (nitroApp: any) => void | Promise<void>;

export function createAuthPlugin(options?: AuthOptions): NitroPluginDef {
  return (nitroApp: any) => {
    markDefaultPluginProvided(nitroApp, "auth");
    const isByoa = Boolean(options?.getSession);
    const app = getH3App(nitroApp);
    const sessionPath = "/_agent-native/auth/session";

    // The built-in auth session check is safe to serve while unrelated
    // default plugins are still booting. ClientOnly app shells need this
    // read before they can leave their hydration fallback, and holding it
    // behind the full bootstrap turns an otherwise healthy local login into
    // an indefinite loading state. The normal auth mount below remains the
    // canonical route once initialization has completed.
    if (!isByoa) {
      markFrameworkRoutesReadyBeforeBootstrap(nitroApp, [sessionPath]);
      app.use(sessionPath, async (event: any) => {
        const method = getMethod(event);
        if (method !== "GET" && method !== "HEAD") {
          setResponseStatus(event, 405);
          return { error: "Method not allowed" };
        }
        const session = await getSession(event);
        return session ?? { error: "Not authenticated" };
      });
    }
    const initPromise = (async () => {
      // A BYOA provider owns its session lookup and login HTML. Mount it
      // immediately so a transient database outage in Better Auth or another
      // default plugin cannot make the custom sign-in document unavailable.
      if (isByoa) {
        // The guard is mounted synchronously by the BYOA branch above. Only
        // after that synchronous registration is it safe to let these paths
        // skip unrelated bootstrap work.
        const mountPromise = autoMountAuth(app, options);
        markFrameworkRoutesReadyBeforeBootstrap(
          nitroApp,
          FRAMEWORK_AUTH_EARLY_PATHS,
        );
        await mountPromise;
        return;
      }
      await awaitBootstrap(nitroApp);
      // guard:allow-boot-data-work — local/long-lived runtimes provision auth
      // before mounting routes; production functions are rejected by the
      // migration runner and use the release job instead.
      await runBetterAuthMigrations(nitroApp);
      await autoMountAuth(app, options);
    })();
    trackPluginInit(nitroApp, initPromise, {
      paths: [...FRAMEWORK_AUTH_EARLY_PATHS],
      ...(isByoa ? {} : { excludedPaths: [sessionPath] }),
    });
  };
}

/**
 * Default auth plugin — email/password auth with optional Google OAuth.
 * Google sign-in button appears automatically on the login page when
 * GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars are set.
 */
export const defaultAuthPlugin: NitroPluginDef = async (nitroApp: any) => {
  return createAuthPlugin()(nitroApp);
};
