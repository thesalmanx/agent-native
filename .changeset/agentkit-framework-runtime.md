---
"@agent-native/agentkit-adapters": minor
"@agent-native/agentkit": minor
"@agent-native/agentkit-client": minor
"@agent-native/agentkit-conformance": minor
"@agent-native/agentkit-protocol": minor
"@agent-native/agentkit-react": minor
---

Introduce the Agent Experience Framework as six focused public packages with a
versioned, provider-neutral protocol; validated messages, runs, capabilities,
approvals, activities, smart objects, uploads, actions, participants, tasks,
custom content, and durable thread snapshots; and typed compatibility,
cancellation, and error semantics. Add the headless client, resumable HTTP and
SSE adapters, executable transport conformance, and composable React provider,
hooks, slots, registries, semantic UI, safe streamed Markdown, run recovery,
host-aware copy confirmation, capability-gated feedback and forking with
visible mutation state, and durable queued-message promotion.
Add typed, replay-safe contextual connection requests with host-controlled
setup, retry, decline, and resumable-run handling.
Choice prompts now offer a focused custom response by default, preserve that
answer separately from predefined option ids across transports, and let hosts
disable the affordance for deliberately constrained workflows.
Completed activity groups now collapse to a duration-aware “Worked for…” row
while preserving their expandable action history.
Run startup now becomes active before the first streamed event arrives, keeping
rapid follow-ups in the durable queue instead of launching overlapping runs.
Transcript following ignores queue-only state churn, follows queue-driven
viewport resizing, distinguishes programmatic scrolls from deliberate history
navigation, and avoids redundant scroll writes during sustained streamed
output.
