// @vitest-environment happy-dom

import { readFileSync } from "node:fs";

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const chatSurfaceState = vi.hoisted(() => ({
  props: null as Record<string, unknown> | null,
}));

vi.mock("@agent-native/core/client/agent-chat", () => ({
  AgentChatSurface: (props: Record<string, unknown>) => {
    chatSurfaceState.props = props;
    return (
      <div data-agent-chat-surface="true">
        {props.pageToolbarSlot as React.ReactNode}
      </div>
    );
  },
  markAgentChatHomeHandoff: vi.fn(),
}));

vi.mock("@agent-native/core/client/i18n", () => ({
  useT: () => (key: string) => key,
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
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

import ChatRoute from "./_index";

describe("ChatRoute AgentKit reference surface", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    chatSurfaceState.props = null;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("leaves next actions empty until the agent injects them", () => {
    act(() => root.render(<ChatRoute />));

    expect(chatSurfaceState.props).toMatchObject({
      mode: "page",
      dynamicSuggestions: false,
      suggestionPlacement: "context-chips",
      showPageNewChatButton: false,
    });
    expect(chatSurfaceState.props).not.toHaveProperty("suggestions");
  });

  it("marks the full-page Chat route as a flat canvas", () => {
    const layoutSource = readFileSync(
      "app/components/layout/Layout.tsx",
      "utf8",
    );

    expect(layoutSource).toContain('data-agent-chat-canvas="true"');
  });

  it("toggles the app-owned workspace beside the AgentKit canvas", () => {
    act(() => root.render(<ChatRoute />));

    expect(
      container.querySelector("[data-agent-page-workspace-toggle]"),
    ).toBeNull();

    act(() => {
      const reportVisibility = chatSurfaceState.props
        ?.onPageHeaderVisibilityChange as
        | ((visible: boolean) => void)
        | undefined;
      reportVisibility?.(true);
    });

    const toggle = container.querySelector<HTMLButtonElement>(
      "[data-agent-page-workspace-toggle]",
    );
    const panel = container.querySelector<HTMLElement>(
      "[data-agent-chat-workspace-panel]",
    );
    const chatSurface = container.querySelector<HTMLElement>(
      "[data-agent-chat-surface]",
    );
    expect(toggle).not.toBeNull();
    expect(chatSurface?.contains(toggle)).toBe(false);
    expect(
      chatSurface?.querySelector("[data-agent-page-workspace-reservation]"),
    ).not.toBeNull();
    expect(panel?.dataset.state).toBe("closed");
    expect(panel?.getAttribute("aria-hidden")).toBe("true");

    act(() => toggle?.click());
    expect(panel?.dataset.state).toBe("open");
    expect(
      chatSurface?.querySelector("[data-agent-page-workspace-reservation]"),
    ).toBeNull();
    expect(panel?.hasAttribute("aria-hidden")).toBe(false);
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
    expect(
      container.querySelector('button[aria-label="chat.closeWorkspace"]'),
    ).toBeNull();
    expect(
      container
        .querySelector(".agent-kit-chat-canvas-toolbar")
        ?.classList.contains("border-b"),
    ).toBe(true);

    act(() => toggle?.click());
    expect(panel?.dataset.state).toBe("closed");

    act(() => toggle?.click());
    expect(panel?.dataset.state).toBe("open");

    act(() => {
      const reportVisibility = chatSurfaceState.props
        ?.onPageHeaderVisibilityChange as
        | ((visible: boolean) => void)
        | undefined;
      reportVisibility?.(false);
    });
    expect(
      container.querySelector("[data-agent-page-workspace-toggle]"),
    ).toBeNull();
    expect(panel?.dataset.state).toBe("closed");
  });
});
