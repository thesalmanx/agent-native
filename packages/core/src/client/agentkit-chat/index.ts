/**
 * Narrow Core bridge for applications that render AgentKit as their primary
 * Chat surface. The legacy `client/agent-chat` entry remains the complete
 * compatibility API; importing it from an AgentKit route would also evaluate
 * unrelated panels, settings, editors, and observability UI on cold start.
 */
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
export { CoreComposerRuntimeProvider } from "../composer/runtime-adapters.js";
export {
  findMcpConnectionSuggestionIntegration,
  McpConnectionSuggestion,
} from "../resources/McpConnectionSuggestion.js";
export {
  McpAgentKitConnectionRequestCard,
  McpAgentKitConnectionResume,
} from "../resources/McpAgentKitConnectionRequest.js";
export { useAgentChatRunningThreads } from "../use-agent-chat-running-threads.js";
