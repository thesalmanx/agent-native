// @vitest-environment happy-dom

import { readFileSync } from "node:fs";

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routeState = vi.hoisted(() => ({
  threadId: undefined as string | undefined,
  messages: [] as Array<{ id: string }>,
  title: undefined as string | undefined,
  navigate: vi.fn(),
  transport: undefined as
    | { id: string; dispose: ReturnType<typeof vi.fn> }
    | undefined,
  transports: [] as Array<{
    id: string;
    dispose: ReturnType<typeof vi.fn>;
  }>,
  rootProps: null as Record<string, unknown> | null,
  chatProps: null as Record<string, unknown> | null,
  resolveConnectionRequest: vi.fn(),
  sendMessage: vi.fn(),
}));

const createTransport = vi.hoisted(() =>
  vi.fn(() => {
    const transport = {
      id: `agent-native-agentkit-${routeState.transports.length + 1}`,
      dispose: vi.fn(),
    };
    routeState.transport = transport;
    routeState.transports.push(transport);
    return transport;
  }),
);
const markHandoff = vi.hoisted(() => vi.fn());

vi.mock("@agent-native/core/client/agent-chat", () => ({
  createAgentNativeAgentKitTransport: createTransport,
  GuidedQuestionFlow: () => null,
  markAgentChatHomeHandoff: markHandoff,
  useGuidedQuestionFlow: () => ({
    questions: null,
    handleSubmit: vi.fn(),
    handleSkip: vi.fn(),
  }),
}));

vi.mock("@agent-native/agentkit/react", () => ({
  AgentConnectionRequestCard: () => null,
  AgentKitRoot: (props: Record<string, unknown>) => {
    routeState.rootProps = props;
    return <>{props.children as React.ReactNode}</>;
  },
  AgentKitChat: (props: Record<string, unknown>) => {
    routeState.chatProps = props;
    return (
      <div data-agentkit-chat="">
        {routeState.messages.length > 0
          ? (props.toolbar as React.ReactNode)
          : null}
      </div>
    );
  },
  useAgentThread: () => ({
    messages: routeState.messages,
    thread: routeState.title ? { title: routeState.title } : undefined,
  }),
  useAgentKit: () => ({
    threadId: routeState.threadId ?? "new-thread",
    controller: {
      resolveConnectionRequest: routeState.resolveConnectionRequest,
      sendMessage: routeState.sendMessage,
    },
  }),
  useAgentKitControl: () => ({
    resolveConnectionRequest: routeState.resolveConnectionRequest,
  }),
}));

vi.mock("@agent-native/core/client/i18n", () => ({
  useT: () => (key: string) => key,
}));

vi.mock("@agent-native/core/client/composer", () => ({
  CoreComposerRuntimeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-core-composer-runtime="">{children}</div>,
}));

vi.mock("react-router", () => ({
  useNavigate: () => routeState.navigate,
  useParams: () => ({ threadId: routeState.threadId }),
}));

vi.mock("@/lib/app-config", () => ({ APP_TITLE: "Chat" }));
vi.mock("@/lib/tab-id", () => ({ TAB_ID: "chat-tab" }));
vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

import ChatRoute from "./home";

describe("ChatRoute AgentKit surface", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    routeState.threadId = undefined;
    routeState.messages = [];
    routeState.title = undefined;
    routeState.navigate.mockReset();
    routeState.transport = undefined;
    routeState.transports = [];
    routeState.rootProps = null;
    routeState.chatProps = null;
    routeState.resolveConnectionRequest.mockReset();
    routeState.sendMessage.mockReset();
    createTransport.mockClear();
    markHandoff.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("mounts the real Agent-Native transport into AgentKit", () => {
    act(() => root.render(<ChatRoute />));

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        browserTabId: "chat-tab",
        surface: "app",
        adapter: { textFormat: "markdown" },
      }),
    );
    expect(routeState.rootProps).toMatchObject({
      transport: routeState.transport,
      clientOptions: {
        transportOwnership: "owned",
        retainActiveRunsOnThreadRelease: true,
      },
      labels: { composerPlaceholder: "chat.composerPlaceholder" },
      slots: {
        emptyState: expect.any(Function),
        messageSupplement: expect.any(Function),
        connectionRequest: expect.any(Function),
        footer: expect.any(Function),
      },
    });
    expect(routeState.rootProps?.slots).not.toHaveProperty("text");
    expect(routeState.chatProps).toMatchObject({
      title: "Chat",
      emptyComposerPlacement: "center",
      composerProps: {
        queueWhileRunning: true,
        autoFocus: true,
        plusMenuMode: "full",
        voiceEnabled: true,
        includeDefaultSlashCommands: false,
        includeDefaultSlashSkills: false,
      },
    });
    expect(
      container.querySelector("[data-core-composer-runtime]"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-agent-page-workspace-toggle]"),
    ).toBeNull();
  });

  it("keeps one owned transport across routed threads", () => {
    routeState.threadId = "thread-one";
    act(() => root.render(<ChatRoute />));
    const firstTransport = routeState.transport;

    routeState.threadId = "thread-two";
    act(() => root.render(<ChatRoute />));
    const secondTransport = routeState.transport;

    expect(secondTransport).toBe(firstTransport);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(routeState.rootProps).toMatchObject({
      transport: secondTransport,
      clientOptions: {
        transportOwnership: "owned",
        retainActiveRunsOnThreadRelease: true,
      },
    });
  });

  it("switches the home composer to the new thread before navigation paints", () => {
    act(() => root.render(<ChatRoute />));

    act(() => {
      window.dispatchEvent(
        new CustomEvent("agent-chat:open-thread", {
          detail: { threadId: "thread-new", newThread: true },
        }),
      );
    });

    expect(routeState.rootProps?.threadId).toBe("thread-new");
  });

  it("enters durable chat mode and exposes the workspace toolbar", () => {
    routeState.messages = [{ id: "user-1" }];
    routeState.title = "Release review";

    act(() => root.render(<ChatRoute />));

    const toggle = container.querySelector<HTMLButtonElement>(
      "[data-agent-page-workspace-toggle]",
    );
    const panel = container.querySelector<HTMLElement>(
      "[data-agent-chat-workspace-panel]",
    );
    expect(routeState.chatProps?.title).toBe("Release review");
    expect(toggle).not.toBeNull();
    expect(panel?.dataset.state).toBe("closed");
    expect(markHandoff).toHaveBeenCalledWith("chat");
    expect(routeState.navigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/chat\/chat-/),
      { replace: true },
    );

    act(() => toggle?.click());
    expect(panel?.dataset.state).toBe("open");
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps the full-page Chat route as a flat canvas", () => {
    const layoutSource = readFileSync(
      "app/components/layout/Layout.tsx",
      "utf8",
    );

    expect(layoutSource).toContain('data-agent-chat-canvas="true"');
  });
});
