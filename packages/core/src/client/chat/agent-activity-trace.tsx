import {
  IconBrain,
  IconCheck,
  IconChevronRight,
  IconCode,
  IconPencil,
  IconSearch,
  IconTool,
} from "@tabler/icons-react";
import React, { useState } from "react";

import { cn } from "../utils.js";

export type AgentActivityVariant = "steps" | "reasoning" | "search" | "coding";
export type AgentActivityDisplayMode = "status" | "timeline" | "auto";

export type AgentActivityStatus = "running" | "complete" | "error";

export interface AgentActivityItem {
  id: string;
  label: string;
  detail?: string;
  summary?: React.ReactNode;
  variant?: AgentActivityVariant;
  status?: AgentActivityStatus;
}

export interface AgentActivityTraceProps {
  items: AgentActivityItem[];
  summary: string;
  activeSummary?: string;
  variant?: AgentActivityVariant;
  running?: boolean;
  displayMode?: AgentActivityDisplayMode;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

function ActivityIcon({ item }: { item: AgentActivityItem }) {
  const iconClass = "size-3.5 shrink-0";
  if (item.status === "error") return <IconTool className={iconClass} />;
  switch (item.variant) {
    case "reasoning":
      return <IconBrain className={iconClass} />;
    case "search":
      return <IconSearch className={iconClass} />;
    case "coding":
      return <IconCode className={iconClass} />;
    case "steps":
      return <IconCheck className={iconClass} />;
    default:
      return <IconPencil className={iconClass} />;
  }
}

export interface AgentActivityChipProps {
  item: AgentActivityItem;
  index?: number;
  selected?: boolean;
  onSelect?: (item: AgentActivityItem) => void;
}

export function AgentActivityChip({
  item,
  index = 0,
  selected = false,
  onSelect,
}: AgentActivityChipProps) {
  return (
    <button
      type="button"
      aria-label={`Show ${item.label} details`}
      aria-pressed={selected}
      onClick={() => onSelect?.(item)}
      className={cn(
        "agent-activity-trace__icon flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground",
        index > 0 && "-ms-0.5",
        item.status === "running" && "text-primary",
        "transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary text-primary",
      )}
    >
      <ActivityIcon item={item} />
    </button>
  );
}

export function AgentActivityTrace({
  items,
  summary,
  activeSummary,
  variant = "steps",
  running = false,
  displayMode = "timeline",
  defaultOpen = false,
  children,
}: AgentActivityTraceProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const visibleSummary = running && activeSummary ? activeSummary : summary;
  const visibleItems =
    displayMode === "status" || (displayMode === "auto" && running)
      ? items.slice(-1)
      : items.slice(0, 5);
  const selectedItem = items.find((item) => item.id === selectedItemId);

  const toggleItem = (itemId: string) => {
    setSelectedItemId((current) => (current === itemId ? null : itemId));
    setOpen(true);
  };

  return (
    <div
      className="agent-activity-trace my-1 w-full"
      data-agent-activity-variant={variant}
      data-agent-activity-running={running ? "true" : undefined}
    >
      <div className="flex min-w-0 items-center gap-2 py-1 text-left text-[13px] text-muted-foreground">
        <span className="agent-activity-trace__icons flex shrink-0 items-center">
          {visibleItems.map((item, index) => (
            <AgentActivityChip
              key={item.id}
              item={item}
              index={index}
              selected={selectedItemId === item.id}
              onSelect={(selected) => toggleItem(selected.id)}
            />
          ))}
        </span>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn(
              "min-w-0 truncate font-medium",
              running && "agent-running-shimmer",
            )}
            role="status"
            aria-live="polite"
          >
            {visibleSummary}
          </span>
          <IconChevronRight
            className={cn(
              "size-3.5 shrink-0 transition-transform",
              open && "rotate-90",
            )}
          />
        </button>
      </div>
      {open ? (
        <div
          className={cn(
            "agent-activity-trace__details pt-1",
            selectedItem
              ? "border-s border-border/70"
              : "border-s border-border/70 ps-4",
          )}
        >
          {selectedItem ? (
            <div className="rounded-md bg-muted/35 px-3 py-2 text-xs text-foreground">
              {selectedItem.summary ? (
                selectedItem.summary
              ) : (
                <>
                  <div className="font-medium">{selectedItem.label}</div>
                  {selectedItem.detail ? (
                    <div className="mt-1 text-muted-foreground">
                      {selectedItem.detail}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : children ? (
            <div className="pt-2">{children}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
