import {
  IconBrain,
  IconCode,
  IconFile,
  IconPlayerPlay,
  IconSearch,
} from "@tabler/icons-react";

import { cn } from "../utils.js";

export type ToolChipKind = "think" | "write" | "run" | "read";
export type ToolChipTone = "default" | "add" | "remove";

export interface ToolChipDetail {
  text: string;
  tone?: ToolChipTone;
}

export interface ToolChipStep {
  id: string;
  kind: ToolChipKind;
  label: string;
  chip: string;
  details?: ToolChipDetail[];
  mono?: boolean;
}

export interface ToolChipDiff {
  id: string;
  file: string;
  additions: number;
  deletions?: number;
}

export interface ToolChipsProps {
  steps?: ToolChipStep[];
  diffs?: ToolChipDiff[];
  className?: string;
}

const KIND_ICONS = {
  think: IconBrain,
  write: IconCode,
  run: IconPlayerPlay,
  read: IconSearch,
} as const;

function DetailLine({ line }: { line: ToolChipDetail }) {
  return (
    <span
      className={cn(
        "truncate font-mono text-[11px] leading-relaxed",
        line.tone === "add" && "text-green",
        line.tone === "remove" && "text-red",
        line.tone === "default" && "text-muted-foreground",
      )}
    >
      {line.text}
    </span>
  );
}

function ToolStepRow({ step }: { step: ToolChipStep }) {
  const Icon = KIND_ICONS[step.kind];
  const hasDetails = Boolean(step.details?.length);

  return (
    <div>
      <div className="flex min-h-7 w-full min-w-0 items-center gap-2 rounded-md px-1.5 text-left text-xs">
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <span className="shrink-0 font-medium text-foreground/85">
          {step.label}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate rounded-md bg-muted/55 px-1.5 py-0.5 text-[11px] text-muted-foreground",
            step.mono && "font-mono",
          )}
        >
          {step.chip}
        </span>
      </div>
      {hasDetails && step.details ? (
        <div className="ms-6 flex flex-col gap-0.5 py-0.5 ps-2">
          {step.details.map((line, index) => (
            <DetailLine key={`${step.id}-detail-${index}`} line={line} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DiffChip({ diff }: { diff: ToolChipDiff }) {
  return (
    <div className="inline-flex min-h-7 max-w-full items-center gap-2 rounded-md border border-border bg-background px-2 font-mono text-[11px] text-muted-foreground shadow-sm">
      <IconFile className="size-3 shrink-0" />
      <span className="min-w-0 truncate">{diff.file}</span>
      <span className="shrink-0 text-green">+{diff.additions}</span>
      {diff.deletions ? (
        <span className="shrink-0 text-red">−{diff.deletions}</span>
      ) : null}
    </div>
  );
}

export function ToolChips({
  steps = [],
  diffs = [],
  className,
}: ToolChipsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col gap-1">
        {steps.map((step) => (
          <ToolStepRow key={step.id} step={step} />
        ))}
        {diffs.length ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {diffs.map((diff) => (
              <DiffChip key={diff.id} diff={diff} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
