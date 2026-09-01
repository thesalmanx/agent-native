import type {
  AgentConnectionRequest,
  AgentMessage,
} from "@agent-native/agentkit";
import {
  AgentConnectionRequestCard,
  AgentKitChat,
  AgentKitRoot,
  useAgentKit,
  useAgentKitControl,
  useAgentThread,
  type AgentKitRenderProps,
} from "@agent-native/agentkit/react";
import {
  createAgentNativeAgentKitTransport,
  CoreComposerRuntimeProvider,
  GuidedQuestionFlow,
  findMcpConnectionSuggestionIntegration,
  markAgentChatHomeHandoff,
  McpAgentKitConnectionRequestCard,
  McpAgentKitConnectionResume,
  McpConnectionSuggestion,
  useGuidedQuestionFlow,
} from "@agent-native/core/client/agentkit-chat";
import { useT } from "@agent-native/core/client/i18n";
import { IconLayoutSidebarRight } from "@tabler/icons-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_TITLE } from "@/lib/app-config";
import { TAB_ID } from "@/lib/tab-id";

const SEO_TITLE = `${APP_TITLE} - Open Source AI app starter with actions`;
const SEO_DESCRIPTION =
  "Open Source starter for agent-native apps with durable chat, shared actions, UI state, tools, and a backend your agent can extend.";

export function meta() {
  return [
    { title: SEO_TITLE },
    {
      name: "description",
      content: SEO_DESCRIPTION,
    },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

function chatThreadPath(threadId: string | null) {
  return threadId ? `/chat/${encodeURIComponent(threadId)}` : "/home";
}

export default function ChatRoute() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [homeThreadId, setHomeThreadId] = useState(
    () =>
      `chat-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`,
  );
  const resolvedThreadId = threadId ?? homeThreadId;
  const [transport] = useState(() =>
    createAgentNativeAgentKitTransport({
      browserTabId: TAB_ID,
      surface: "app",
      adapter: { textFormat: "markdown" },
    }),
  );

  useEffect(() => {
    const handleOpenThread = (event: Event) => {
      const detail = (
        event as CustomEvent<{ threadId?: unknown; newThread?: unknown }>
      ).detail;
      if (detail?.newThread !== true || typeof detail.threadId !== "string") {
        return;
      }
      setHomeThreadId(detail.threadId);
    };
    window.addEventListener("agent-chat:open-thread", handleOpenThread);
    return () =>
      window.removeEventListener("agent-chat:open-thread", handleOpenThread);
  }, []);

  useEffect(() => {
    if (threadId) return;
    markAgentChatHomeHandoff("chat");
    navigate(chatThreadPath(homeThreadId), { replace: true });
  }, [homeThreadId, navigate, threadId]);

  return (
    <div
      className="relative flex h-full min-h-0 overflow-hidden bg-background"
      data-agent-chat-workspace-state={workspaceOpen ? "open" : "closed"}
    >
      <div
        className={`agent-kit-chat-canvas-body min-w-0 flex-none ${
          workspaceOpen ? "agent-kit-chat-canvas-body--workspace-open" : ""
        }`}
      >
        <CoreComposerRuntimeProvider>
          <AgentKitRoot
            transport={transport}
            clientOptions={{
              transportOwnership: "owned",
              retainActiveRunsOnThreadRelease: true,
            }}
            threadId={resolvedThreadId}
            labels={{ composerPlaceholder: t("chat.composerPlaceholder") }}
            slots={{
              emptyState: ChatEmptyState,
              messageSupplement: ChatMcpConnectionSuggestion,
              connectionRequest: ChatMcpConnectionRequest,
              footer: ChatAgentFooter,
            }}
            onThreadForked={(thread) => navigate(chatThreadPath(thread.id))}
          >
            <ChatMcpConnectionResume />
            <ChatCanvas
              routeThreadId={threadId}
              resolvedThreadId={resolvedThreadId}
              workspaceOpen={workspaceOpen}
              setWorkspaceOpen={setWorkspaceOpen}
              navigate={navigate}
            />
          </AgentKitRoot>
        </CoreComposerRuntimeProvider>
      </div>
      <aside
        data-agent-chat-workspace-panel=""
        data-state={workspaceOpen ? "open" : "closed"}
        aria-hidden={workspaceOpen ? undefined : true}
        inert={workspaceOpen ? undefined : true}
        className="agent-kit-workspace-panel absolute end-0 flex flex-col border-s border-border bg-background shadow-lg md:shadow-none"
      >
        <header className="agent-kit-workspace-panel__header flex shrink-0 items-center border-b border-border px-3">
          <h2 className="min-w-0 truncate text-xs font-medium text-foreground">
            {t("settings.workspaceTitle")}
          </h2>
        </header>
        <div data-agent-chat-workspace-slot="" className="min-h-0 flex-1" />
      </aside>
    </div>
  );
}

function ChatAgentFooter({ children }: { children: ReactNode }) {
  const { controller, threadId } = useAgentKit();
  const submitAnswers = useCallback(
    ({ formattedAnswers }: { formattedAnswers: string }) => {
      void controller.sendMessage({ threadId, text: formattedAnswers });
    },
    [controller, threadId],
  );
  const skipQuestions = useCallback(
    ({ message }: { message: string }) => {
      void controller.sendMessage({ threadId, text: message });
    },
    [controller, threadId],
  );
  const {
    questions,
    title,
    description,
    skipLabel,
    submitLabel,
    handleSubmit,
    handleSkip,
  } = useGuidedQuestionFlow({
    stateKey: "guided-questions",
    queryKey: ["guided-questions", "agentkit"],
    browserTabId: TAB_ID,
    threadId,
    onSubmitMessage: submitAnswers,
    onSkipMessage: skipQuestions,
  });

  return (
    <div className="agent-kit-chat-footer-stack">
      {questions?.length ? (
        <div className="agent-kit-chat-guided-question">
          <GuidedQuestionFlow
            questions={questions}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            {...(title ? { title } : {})}
            {...(description ? { description } : {})}
            {...(skipLabel ? { skipLabel } : {})}
            {...(submitLabel ? { submitLabel } : {})}
            className="h-auto items-stretch justify-stretch bg-transparent"
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}

function ChatMcpConnectionRequest({
  value: request,
  runId,
}: AgentKitRenderProps<AgentConnectionRequest> & { runId: string }) {
  const control = useAgentKitControl();
  const { threadId } = useAgentKit();
  if (request.status === "connected" || request.status === "declined") {
    return <AgentConnectionRequestCard request={request} runId={runId} />;
  }
  const resolve = (status: "connected" | "declined") =>
    control.resolveConnectionRequest(runId, request.id, { status });
  return (
    <McpAgentKitConnectionRequestCard
      provider={request.provider}
      {...(request.detail ? { detail: request.detail } : {})}
      target={{ threadId, runId, requestId: request.id }}
      onConnected={() => resolve("connected")}
      onDeclined={() => resolve("declined")}
      fallback={<AgentConnectionRequestCard request={request} runId={runId} />}
    />
  );
}

function ChatMcpConnectionResume() {
  const { controller, threadId } = useAgentKit();
  const onResume = useCallback(
    async (
      target: { threadId: string; runId: string; requestId: string },
      request: { message: string },
    ) => {
      try {
        await controller.resolveConnectionRequest({
          ...target,
          response: { status: "connected" },
        });
      } catch {
        await controller.sendMessage({
          threadId: target.threadId,
          text: request.message,
        });
      }
    },
    [controller],
  );
  const onMessageResume = useCallback(
    async (request: { message: string }) => {
      await controller.sendMessage({ threadId, text: request.message });
    },
    [controller, threadId],
  );
  return (
    <McpAgentKitConnectionResume
      onResume={onResume}
      onMessageResume={onMessageResume}
    />
  );
}

function messageText(message: AgentMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function ChatMcpConnectionSuggestion({
  value: message,
  threadId,
}: AgentKitRenderProps<AgentMessage>) {
  const thread = useAgentThread(threadId);
  if (message.role !== "assistant" || message.status === "streaming") {
    return null;
  }
  const responseText = messageText(message);
  const messageIndex = thread.messages.findIndex(
    (candidate) => candidate.id === message.id,
  );
  let contextText = "";
  for (let index = messageIndex - 1; index >= 0; index -= 1) {
    const candidate = thread.messages[index];
    if (candidate?.role === "user") {
      contextText = messageText(candidate);
      break;
    }
  }
  const integration = findMcpConnectionSuggestionIntegration({
    text: responseText,
    contextText,
    variant: "response",
  });
  if (!integration) return null;
  const hasStructuredRequest = Object.values(
    thread.connectionRequests ?? {},
  ).some(
    (request) =>
      request.provider.trim().toLowerCase() === integration.id.toLowerCase() ||
      request.provider.trim().toLowerCase() ===
        integration.provider.toLowerCase(),
  );
  if (hasStructuredRequest) return null;
  return (
    <McpConnectionSuggestion
      text={responseText}
      contextText={contextText}
      variant="response"
      requestedByAgent
      integrationId={integration.id}
    />
  );
}

function ChatEmptyState() {
  const t = useT();
  return (
    <div className="agentkit-chat-empty-copy">
      <h1>{t("chat.heroTitle")}</h1>
      <p>{t("chat.heroDescription")}</p>
    </div>
  );
}

function ChatCanvas({
  routeThreadId,
  resolvedThreadId,
  workspaceOpen,
  setWorkspaceOpen,
  navigate,
}: {
  routeThreadId?: string;
  resolvedThreadId: string;
  workspaceOpen: boolean;
  setWorkspaceOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const t = useT();
  const thread = useAgentThread();
  const hasConversation = thread.messages.length > 0;

  useEffect(() => {
    if (!hasConversation) {
      setWorkspaceOpen(false);
      return;
    }
    if (!routeThreadId) {
      markAgentChatHomeHandoff("chat");
      navigate(chatThreadPath(resolvedThreadId), { replace: true });
    }
  }, [
    hasConversation,
    navigate,
    resolvedThreadId,
    routeThreadId,
    setWorkspaceOpen,
  ]);

  const toolbar = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-agent-page-workspace-toggle=""
          aria-label={t("settings.workspaceTitle")}
          aria-expanded={workspaceOpen}
          onClick={() => setWorkspaceOpen((open) => !open)}
          className="size-8"
        >
          <IconLayoutSidebarRight className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("settings.workspaceTitle")}</TooltipContent>
    </Tooltip>
  );

  return (
    <AgentKitChat
      className="h-full"
      title={thread.thread?.title ?? APP_TITLE}
      toolbar={toolbar}
      emptyComposerPlacement="center"
      composerProps={{
        queueWhileRunning: true,
        autoFocus: true,
        plusMenuMode: "full",
        voiceEnabled: true,
        includeDefaultSlashCommands: false,
        includeDefaultSlashSkills: false,
      }}
    />
  );
}
