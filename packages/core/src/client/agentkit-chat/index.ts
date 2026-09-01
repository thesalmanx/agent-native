/**
 * Narrow Core bridge for applications that render AgentKit as their primary
 * Chat surface. The legacy `client/agent-chat` entry remains the complete
 * compatibility API; importing it from an AgentKit route would also evaluate
 * unrelated panels, settings, editors, and observability UI on cold start.
 */
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

export {
  GuidedQuestionFlow,
  useGuidedQuestionFlow,
} from "../guided-questions.js";
export { useChatThreads, type ChatThreadSummary } from "../use-chat-threads.js";
export {
  isAgentChatHomeHandoffActive,
  markAgentChatHomeHandoff,
  navigateWithAgentChatViewTransition,
} from "../chat-view-transition.js";
export {
  useAgentChatHomeHandoff,
  useAgentChatHomeHandoffLinks,
} from "../use-agent-chat-home-handoff.js";
export { createAgentNativeAgentKitTransport } from "../chat/agentkit-agent-native.js";
export {
  findMcpConnectionSuggestionIntegration,
  McpConnectionSuggestion,
} from "../resources/McpConnectionSuggestion.js";
export {
  McpAgentKitConnectionRequestCard,
  McpAgentKitConnectionResume,
} from "../resources/McpAgentKitConnectionRequest.js";
export { useAgentChatRunningThreads } from "../use-agent-chat-running-threads.js";

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
