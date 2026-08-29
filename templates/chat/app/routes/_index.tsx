import {
  AgentChatSurface,
  markAgentChatHomeHandoff,
} from "@agent-native/core/client/agent-chat";
import { useT } from "@agent-native/core/client/i18n";
import { IconLayoutSidebarRight } from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
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

const PageAgentChatSurface = AgentChatSurface as ComponentType<
  ComponentProps<typeof AgentChatSurface> & {
    onPageHeaderVisibilityChange?: (visible: boolean) => void;
    pageToolbarSlot?: ReactNode;
    showPageNewChatButton?: boolean;
  }
>;

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
  return threadId ? `/chat/${encodeURIComponent(threadId)}` : "/";
}

export default function ChatRoute() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [pageHeaderVisible, setPageHeaderVisible] = useState(false);
  const threadUrlSync = threadId
    ? {
        routeThreadId: threadId,
        getPath: chatThreadPath,
        navigate,
      }
    : undefined;

  useEffect(() => {
    function handleChatRunning(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (detail?.isRunning === true) markAgentChatHomeHandoff("chat");
    }

    window.addEventListener("agentNative.chatRunning", handleChatRunning);
    return () =>
      window.removeEventListener("agentNative.chatRunning", handleChatRunning);
  }, []);

  const handlePageHeaderVisibilityChange = useCallback((visible: boolean) => {
    setPageHeaderVisible(visible);
    if (!visible) setWorkspaceOpen(false);
  }, []);

  const workspaceToggle = (
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
    <div
      className="relative flex h-full min-h-0 overflow-hidden bg-background"
      data-agent-chat-workspace-state={workspaceOpen ? "open" : "closed"}
    >
      <div
        className={`agent-kit-chat-canvas-body min-w-0 flex-none ${
          workspaceOpen ? "agent-kit-chat-canvas-body--workspace-open" : ""
        }`}
      >
        <PageAgentChatSurface
          mode="page"
          chatViewTransition
          className="h-full"
          defaultMode="chat"
          storageKey="chat"
          threadUrlSync={threadUrlSync}
          browserTabId={TAB_ID}
          showHeader={false}
          showTabBar={false}
          showPageNewChatButton={false}
          pageToolbarSlot={
            workspaceOpen ? null : (
              <span
                aria-hidden="true"
                className="size-8"
                data-agent-page-workspace-reservation=""
              />
            )
          }
          onPageHeaderVisibilityChange={handlePageHeaderVisibilityChange}
          dynamicSuggestions={false}
          suggestionPlacement="context-chips"
          emptyStateText={t("chat.emptyState")}
          emptyStateDisplay="hidden"
          centerComposerWhenEmpty
          composerLayoutVariant="hero"
          composerPlaceholder={t("chat.composerPlaceholder")}
          composerSlot={
            <div className="mx-auto mb-5 max-w-xl px-4 text-center">
              <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                {t("chat.heroTitle")}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("chat.heroDescription")}
              </p>
            </div>
          }
        />
      </div>
      {pageHeaderVisible ? (
        <div className="agent-kit-chat-canvas-toolbar pointer-events-none absolute inset-x-0 top-0 border-b border-border/70">
          <div className="pointer-events-auto absolute end-3 top-2 sm:end-4">
            {workspaceToggle}
          </div>
        </div>
      ) : null}
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
