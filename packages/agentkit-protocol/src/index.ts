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

export interface AgentAnnotation {
  id: string;
  kind: "source" | "entity" | "reference" | (string & {});
  label: string;
  url?: string;
  start?: number;
  end?: number;
  metadata?: Record<string, unknown>;
}

export interface AnnotationPart {
  type: "annotation";
  annotation: AgentAnnotation;
}

export interface FilePart {
  type: "file";
  name: string;
  mediaType?: string;
  url?: string;
  fileId?: string;
}

export interface AgentWidgetAction {
  id: string;
  label: string;
  kind?: "primary" | "secondary" | "danger";
  payload?: unknown;
  disabled?: boolean;
}

export interface AgentWidget {
  id: string;
  kind: string;
  data: unknown;
  title?: string;
  actions?: AgentWidgetAction[];
  state?: "active" | "submitted" | "dismissed" | "expired";
  metadata?: Record<string, unknown>;
}

export interface WidgetPart {
  type: "widget";
  widget: AgentWidget;
}

/** Host-defined message parts keep domain-specific UI out of the base protocol. */
export interface AgentCustomMessagePart {
  type: `x-${string}`;
  [key: string]: unknown;
}

export type AgentMessagePart<
  TCustomPart extends AgentCustomMessagePart = never,
> =
  | TextPart
  | ReasoningPart
  | CitationPart
  | AnnotationPart
  | FilePart
  | WidgetPart
  | TCustomPart;

export interface AgentMessage<
  TCustomPart extends AgentCustomMessagePart = never,
> {
  id: string;
  role: AgentRole;
  parts: AgentMessagePart<TCustomPart>[];
  createdAt?: string;
  status?: "streaming" | "complete" | "error";
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
  kind?: "approval" | "choice" | "input";
  allowMultiple?: boolean;
  options?: Array<{
    id: string;
    label: string;
    description?: string;
    kind?: "primary" | "secondary" | "danger";
  }>;
  input?: {
    id: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "number" | "url";
    required?: boolean;
  };
  expiresAt?: string;
}

export interface AgentApprovalResponse {
  optionIds?: string[];
  input?: Record<string, unknown>;
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
  attachments?: boolean;
  citations?: boolean;
  codeExecution?: boolean;
  widgets?: boolean;
  threadHistory?: boolean;
  threadForking?: boolean;
  messageQueue?: boolean;
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
      type: "message.completed";
      message: AgentMessage;
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
      optionId?: string;
      response?: AgentApprovalResponse;
    })
  | (AgentEventBase & {
      type: "artifact.created";
      artifact: AgentArtifactReference;
    })
  | (AgentEventBase & {
      type: "widget.created" | "widget.updated";
      messageId: string;
      widget: AgentWidget;
    })
  | (AgentEventBase & {
      type: "annotation.created";
      messageId: string;
      annotation: AgentAnnotation;
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
  status?: "active" | "archived" | "deleted";
  metadata?: Record<string, unknown>;
}

export interface AgentQueuedMessage {
  id: string;
  threadId: ThreadId;
  text: string;
  createdAt: string;
  attachments?: FilePart[];
  metadata?: Record<string, unknown>;
}

export interface ListThreadsInput {
  limit?: number;
  cursor?: string;
  metadata?: Record<string, unknown>;
}

export interface ListThreadsResult {
  threads: AgentThread[];
  nextCursor?: string;
}

export interface ThreadIdInput {
  threadId: ThreadId;
}

export interface QueueMessageInput {
  threadId: ThreadId;
  text: string;
  attachments?: FilePart[];
  metadata?: Record<string, unknown>;
}

export interface QueueMessageResult {
  message: AgentQueuedMessage;
}

export interface AgentTransportThreadOperations {
  listThreads?(input?: ListThreadsInput): Promise<ListThreadsResult>;
  getThread?(input: ThreadIdInput): Promise<AgentThread | null>;
  forkThread?(input: ThreadIdInput): Promise<AgentThread>;
  deleteThread?(input: ThreadIdInput): Promise<void>;
  listQueuedMessages?(input: ThreadIdInput): Promise<AgentQueuedMessage[]>;
  queueMessage?(input: QueueMessageInput): Promise<QueueMessageResult>;
  steerQueuedMessage?(input: {
    threadId: ThreadId;
    messageId: string;
  }): Promise<void>;
  removeQueuedMessage?(input: {
    threadId: ThreadId;
    messageId: string;
  }): Promise<void>;
}

export interface AgentTransport extends AgentTransportThreadOperations {
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
  /** Kept for simple approval consumers; use `response` for choices or input. */
  optionId?: string;
  response?: AgentApprovalResponse;
}
