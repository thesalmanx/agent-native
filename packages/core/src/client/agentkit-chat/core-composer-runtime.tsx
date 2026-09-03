import {
  ComposerRuntimeAdaptersProvider,
  type ComposerRuntimeAdapters,
} from "@agent-native/toolkit/composer/runtime-adapters";
import {
  createElement,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { coreComposerModelAdapters } from "../composer/model-runtime-adapters.js";
import { useFormatters, useT } from "../i18n.js";

type CoreComposerAdapters = Omit<ComposerRuntimeAdapters, "translate">;

let coreComposerAdaptersPromise: Promise<CoreComposerAdapters> | undefined;

function loadCoreComposerAdapters(): Promise<CoreComposerAdapters> {
  coreComposerAdaptersPromise ??=
    import("../composer/runtime-adapters.js").then(
      ({ coreComposerAdapters }) => coreComposerAdapters,
    );
  return coreComposerAdaptersPromise;
}

/**
 * Adds Core's full composer integrations after AgentKit can render its shell.
 * The default Toolkit adapters keep the composer interactive during the lazy
 * import; updating this provider does not remount the AgentKit thread runtime.
 */
export function CoreComposerRuntimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const translate = useT();
  const formatters = useFormatters();
  const [coreAdapters, setCoreAdapters] = useState<CoreComposerAdapters>();
  const [loadError, setLoadError] = useState<unknown>();

  useEffect(() => {
    let active = true;
    void loadCoreComposerAdapters().then(
      (adapters) => {
        if (active) setCoreAdapters(adapters);
      },
      (error: unknown) => {
        if (active) setLoadError(error);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const adapters = useMemo<ComposerRuntimeAdapters>(
    () => ({
      ...coreAdapters,
      models: {
        ...coreAdapters?.models,
        ...coreComposerModelAdapters,
      },
      translate,
      formatNumber: (value, options) => formatters.formatNumber(value, options),
    }),
    [coreAdapters, formatters, translate],
  );

  if (loadError) throw loadError;

  return createElement(ComposerRuntimeAdaptersProvider, {
    adapters,
    children,
  });
}
