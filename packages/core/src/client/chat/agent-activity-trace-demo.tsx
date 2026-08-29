import { useEffect, useMemo, useState } from "react";

import {
  AgentActivityTrace,
  type AgentActivityItem,
} from "./agent-activity-trace.js";
import { ToolChips } from "./tool-chips.js";

const DEMO_STEPS: AgentActivityItem[] = [
  {
    id: "thought",
    label: "Plan the workspace health review",
    summary: (
      <ToolChips
        steps={[
          {
            id: "reasoning-plan",
            kind: "think",
            label: "Plan",
            chip: "Prioritize the 30-day activity signal",
          },
        ]}
      />
    ),
    variant: "reasoning",
  },
  {
    id: "search",
    label: "Search workspace activity",
    detail: "last 30 days",
    summary: (
      <ToolChips
        steps={[
          {
            id: "search-results",
            kind: "run",
            label: "Query activity",
            chip: "1,248 events inspected",
          },
        ]}
      />
    ),
    variant: "search",
  },
  {
    id: "read",
    label: "Read analytics schema",
    object: {
      kind: "file",
      label: "analytics.ts",
      mono: true,
    },
    summary: (
      <ToolChips
        steps={[
          {
            id: "read-schema",
            kind: "read",
            label: "Read file",
            chip: "analytics.ts",
          },
        ]}
      />
    ),
    variant: "read",
  },
  {
    id: "edit",
    label: "Update health dashboard",
    detail: "+42 −8",
    summary: (
      <ToolChips
        diffs={[
          {
            id: "health-dashboard",
            file: "packages/dispatch/src/health-dashboard.tsx",
            additions: 42,
            deletions: 8,
          },
        ]}
      />
    ),
    variant: "changes",
  },
  {
    id: "verify",
    label: "Run dashboard checks",
    detail: "12 passed",
    summary: (
      <ToolChips
        steps={[
          {
            id: "verify-checks",
            kind: "run",
            label: "Run checks",
            chip: "pnpm test --filter dashboard",
            mono: true,
          },
        ]}
      />
    ),
    variant: "command",
  },
];

export function AgentActivityTraceDemo() {
  const [visibleSteps, setVisibleSteps] = useState(1);
  const running = visibleSteps < DEMO_STEPS.length;
  const items = useMemo(
    () =>
      DEMO_STEPS.slice(0, visibleSteps).map((item, index) => ({
        ...item,
        status: (index === visibleSteps - 1 && running
          ? "running"
          : "complete") as AgentActivityItem["status"],
      })),
    [running, visibleSteps],
  );

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () =>
        setVisibleSteps((current) => Math.min(DEMO_STEPS.length, current + 1)),
      900,
    );
    return () => window.clearTimeout(timer);
  }, [running, visibleSteps]);

  return (
    <div className="agent-activity-demo">
      <p className="agent-kit-message-bubble-boundary rounded-2xl bg-muted px-3 py-2 text-sm leading-5">
        Review the workspace health, improve the dashboard, and tell me what
        changed.
      </p>
      <div className="mt-4">
        <AgentActivityTrace
          items={items}
          activeSummary={items[items.length - 1]?.label ?? "Working"}
          variant="coding"
          running={running}
          displayMode="auto"
          defaultOpen
        />
        {!running ? (
          <div className="agent-markdown mt-4 text-sm text-foreground">
            The dashboard now includes a workspace health summary, a 30-day
            activity trend, and clearer failure states. All 12 checks passed.
          </div>
        ) : null}
      </div>
    </div>
  );
}
