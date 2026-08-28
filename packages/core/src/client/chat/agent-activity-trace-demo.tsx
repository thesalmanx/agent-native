import { IconArrowUp } from "@tabler/icons-react";
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
    detail: "analytics.ts",
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
    variant: "coding",
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
    variant: "coding",
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
            chip: "12 passed",
          },
        ]}
      />
    ),
    variant: "steps",
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
    <div className="agent-activity-demo flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <p className="max-w-[92%] rounded-2xl bg-muted px-3 py-2 text-sm leading-5">
          Review the workspace health, improve the dashboard, and tell me what
          changed.
        </p>
        <div className="mt-4">
          <AgentActivityTrace
            items={items}
            summary={
              running ? "Working through 5 actions" : "Completed 5 actions"
            }
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
      <div className="border-t border-border px-4 pb-4 pt-3">
        <div className="flex min-h-10 items-center rounded-xl border border-border bg-background px-3 text-sm text-muted-foreground">
          <span className="flex-1">Try another request…</span>
          <IconArrowUp className="size-4 opacity-40" />
        </div>
      </div>
    </div>
  );
}
