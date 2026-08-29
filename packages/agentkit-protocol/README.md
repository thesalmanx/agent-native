# @agent-native/agentkit-protocol

Provider-neutral protocol types for AgentKit.

This package is intentionally dependency-free. It defines the stable language
between an agent backend and AgentKit clients: messages, streamed events, tool
calls, approvals, widgets, annotations, artifacts, capabilities, runs, threads,
queues, and transport operations.

Agent-Native is the reference backend, but the protocol does not require a
particular model provider, database, authentication system, or server
framework. Backend adapters translate their native events into `AgentEvent`
values, while AgentKit UI renders the normalized contract.

## Design principles

- The core event union covers common agent behavior without hiding richer
  backend capabilities.
- `x-*` extension events and capability keys allow backend-specific features
  without coupling the base protocol to one provider.
- IDs and timestamps are represented as strings so hosts can choose UUIDs,
  database IDs, or another stable format.
- Widgets carry serializable data and action payloads; the host decides how to
  render them and how to route those actions through its own action surface.
- Namespaced `x-*` message parts let a host add rich domain UI without forking
  the base union; the host owns validation and rendering for those parts.
- Approval responses support simple confirmation, single or multiple choices,
  and structured input values without requiring a new transport for each card.
- Thread history, branching, queued messages, and steering are optional
  transport operations so a small embed can stay small without blocking a
  full workbench.
- Persistence, authorization, file storage, and transport implementation stay
  outside this package.

This is an early public foundation. Event shapes may evolve before the first
stable AgentKit release.

## Product direction

AgentKit is the reusable conversation framework for Agent-Native products. Its
goal is to provide the completeness of a batteries-included chat framework
without making every product adopt the same visual skin, agent backend, or
workflow model.

The framework is being built around these product goals:

- Deep UI customization through semantic design-system adapters, composable
  primitives, slots, and ejectable source.
- Built-in response streaming with buffering and lifecycle events for natural,
  stable conversational rendering.
- Tool and workflow integration that visualizes actions, progress, approvals,
  artifacts, and safe reasoning summaries. AgentKit does not depend on exposing
  a model's hidden chain-of-thought.
- Rich interactive widgets rendered inline and connected to app actions and
  application state.
- Attachment handling for files and images, with storage represented by
  portable references rather than embedded payloads.
- Thread and message management for branching, queuing, steering, restoring,
  and organizing long-running conversations.
- Source annotations and entity tagging for transparent citations, references,
  and app-aware context.
- Agent-authored next actions that can replace the suggestion row after each
  turn without coupling the UI to a model provider. Suggestions use a concise,
  single-line `label` for the pill and may carry a longer `prompt` to submit.

Agent-Native remains the reference backend. The protocol stays provider-neutral
so other runtimes can implement the same message, run, tool, approval, artifact,
and transport contracts.

## Product boundary

AgentKit is an independent embeddable chat framework. It is designed around
Agent-Native requirements such as provider-neutral events, shared actions,
application state, human approvals, A2A workflows, portable artifacts, and
deeply composable UI. It does not depend on another chat product at runtime or
promise compatibility with a product-specific protocol.
