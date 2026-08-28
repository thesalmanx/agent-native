/** Stable identifiers are strings so hosts can choose their own ID strategy. */
export type AgentId = string;
export type ThreadId = string;
export type RunId = string;
export type EventId = string;
export type ToolCallId = string;
export type ApprovalId = string;

export type AgentRole = "user" | "assistant" | "system" | "tool";

export interface TextPart {
  type: "text";
  text: string;
}

export interface ReasoningPart {
  type: "reasoning";
  text: string;
  visibility?: "visible" | "summary" | "hidden";
}

export interface CitationPart {
  type: "citation";
  title: string;
  url?: string;
  sourceId?: string;
}

export interface FilePart {
  type: "file";
  name: string;
  mediaType?: string;
  url?: string;
  fileId?: string;
}

export type AgentMessagePart =
  | TextPart
  | ReasoningPart
  | CitationPart
  | FilePart;

export interface AgentMessage {
  id: string;
  role: AgentRole;
  parts: AgentMessagePart[];
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export type AgentRunStatus =
  | "queued"
  | "running"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentToolCall {
  id: ToolCallId;
  name: string;
  input?: unknown;
  output?: unknown;
  status: "running" | "completed" | "failed" | "cancelled";
  error?: AgentError;
}

export interface AgentApprovalRequest {
  id: ApprovalId;
  title: string;
  description?: string;
  options?: Array<{
    id: string;
    label: string;
    kind?: "primary" | "secondary" | "danger";
  }>;
  expiresAt?: string;
}

export interface AgentArtifactReference {
  id: string;
  kind: string;
  title?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

/** A provider-neutral next action an agent can publish after a turn. */
export interface AgentSuggestion {
  id: string;
  /** Concise, single-line action label. Put the full instruction in `prompt`. */
  label: string;
  /** Prompt submitted when selected. Defaults to `label`. */
  prompt?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentError {
  code: string;
  message: string;
  retryable?: boolean;
  details?: unknown;
}

export interface AgentUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  currency?: string;
}

export interface AgentCapabilities {
  approvals?: boolean;
  artifacts?: boolean;
  citations?: boolean;
  codeExecution?: boolean;
  reasoning?: "none" | "summary" | "full";
  resumableRuns?: boolean;
  taskGroups?: boolean;
  suggestions?: boolean;
  [extension: `x-${string}`]: unknown;
}

export interface AgentEventBase {
  id: EventId;
  threadId: ThreadId;
  runId: RunId;
  sequence: number;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export type AgentEvent =
  | (AgentEventBase & { type: "run.started"; agentId?: AgentId })
  | (AgentEventBase & { type: "run.status"; status: AgentRunStatus })
  | (AgentEventBase & { type: "message.created"; message: AgentMessage })
  | (AgentEventBase & {
      type: "message.delta";
      messageId: string;
      text: string;
    })
  | (AgentEventBase & {
      type: "reasoning.delta";
      messageId: string;
      text: string;
    })
  | (AgentEventBase & { type: "tool.started"; toolCall: AgentToolCall })
  | (AgentEventBase & { type: "tool.updated"; toolCall: AgentToolCall })
  | (AgentEventBase & {
      type: "approval.requested";
      request: AgentApprovalRequest;
    })
  | (AgentEventBase & {
      type: "approval.resolved";
      approvalId: ApprovalId;
      optionId: string;
    })
  | (AgentEventBase & {
      type: "artifact.created";
      artifact: AgentArtifactReference;
    })
  | (AgentEventBase & {
      type: "suggestions.updated";
      suggestions: AgentSuggestion[];
    })
  | (AgentEventBase & { type: "run.completed"; usage?: AgentUsage })
  | (AgentEventBase & { type: "run.failed"; error: AgentError })
  | (AgentEventBase & { type: "run.cancelled" })
  | (AgentEventBase & { type: `x-${string}`; payload: unknown });

export interface AgentThread {
  id: ThreadId;
  title?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AgentTransport {
  capabilities?: AgentCapabilities;
  startRun(input: StartRunInput): Promise<StartRunResult>;
  subscribeToRun(input: SubscribeToRunInput): AsyncIterable<AgentEvent>;
  cancelRun(input: CancelRunInput): Promise<void>;
  resolveApproval?(input: ResolveApprovalInput): Promise<void>;
}

export interface StartRunInput {
  threadId: ThreadId;
  messages: AgentMessage[];
  metadata?: Record<string, unknown>;
}

export interface StartRunResult {
  runId: RunId;
  capabilities?: AgentCapabilities;
}

export interface SubscribeToRunInput {
  threadId: ThreadId;
  runId: RunId;
  afterSequence?: number;
}

export interface CancelRunInput {
  threadId: ThreadId;
  runId: RunId;
}

export interface ResolveApprovalInput {
  threadId: ThreadId;
  runId: RunId;
  approvalId: ApprovalId;
  optionId: string;
}
