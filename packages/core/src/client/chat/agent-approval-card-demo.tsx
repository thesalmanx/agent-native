import { useState } from "react";

import { AgentApprovalCard, AgentChoiceCard } from "./agent-approval-card.js";

export function AgentApprovalCardDemo() {
  const [resolution, setResolution] = useState<"approved" | "denied" | null>(
    null,
  );

  return (
    <div className="agent-activity-demo">
      <p className="agent-kit-message-bubble-boundary rounded-2xl bg-muted px-3 py-2 text-sm leading-5">
        Review the workspace health and update the dashboard if the changes look
        safe.
      </p>
      <div className="mt-4 text-sm leading-5 text-foreground">
        I found a dashboard update ready to apply. It changes the activity trend
        and removes a stale metric.
      </div>
      <AgentApprovalCard
        toolName="Update health dashboard"
        question="Approve this dashboard update?"
        approveLabel="Approve"
        denyLabel="Deny"
        moreOptionsLabel="More approval options"
        alwaysAllowLabel="Always allow this action"
        alwaysAllowHint="Approve and always allow this action"
        onApprove={() => setResolution("approved")}
        onDeny={() => setResolution("denied")}
        onAlwaysAllow={() => setResolution("approved")}
      />
      {resolution ? (
        <div className="mt-3 text-xs text-muted-foreground">
          {resolution === "approved"
            ? "Approved. The agent can continue."
            : "Denied. The action did not run."}
        </div>
      ) : null}
      {resolution ? (
        <AgentChoiceCard
          question="Which dashboard view should I prioritize?"
          options={[
            {
              value: "activity",
              label: "Activity trend",
              description: "Highlight the last 30 days of workspace activity.",
              recommended: true,
            },
            {
              value: "failures",
              label: "Failure states",
              description: "Make errors and recovery paths easier to scan.",
            },
            {
              value: "both",
              label: "Both views",
              description: "Include both in the next dashboard pass.",
            },
          ]}
          submitLabel="Continue"
          skipLabel="Skip"
          onSubmit={() => undefined}
          onSkip={() => undefined}
        />
      ) : null}
    </div>
  );
}
