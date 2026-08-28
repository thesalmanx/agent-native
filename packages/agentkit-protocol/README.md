# @agent-native/agentkit-protocol

Provider-neutral protocol types for AgentKit.

This package is intentionally dependency-free. It defines the stable language
between an agent backend and AgentKit clients: messages, streamed events, tool
calls, approvals, artifacts, capabilities, runs, and transport operations.

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

## Source and design references

[OpenAI ChatKit JS](https://github.com/openai/chatkit-js) is an explicit product
and architecture reference for AgentKit. Its feature scope and interaction model
are useful benchmarks for a complete embeddable chat framework. The project is
licensed under Apache-2.0.

AgentKit is not a fork of ChatKit and does not require ChatKit at runtime. We use
it as a comparative reference while designing independently around Agent-Native
requirements such as provider-neutral events, shared actions, application state,
human approvals, A2A workflows, portable artifacts, and deeply composable UI.
