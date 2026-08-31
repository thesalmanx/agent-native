import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

const bufferedTextCache = new Map<string, string>();
const maximumCacheEntries = 128;

function graphemes(text: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return Array.from(segmenter.segment(text), (entry) => entry.segment);
  }
  return Array.from(text);
}

function remember(resetKey: string, text: string): void {
  bufferedTextCache.delete(resetKey);
  bufferedTextCache.set(resetKey, text);
  if (bufferedTextCache.size <= maximumCacheEntries) return;
  const oldest = bufferedTextCache.keys().next().value;
  if (oldest) bufferedTextCache.delete(oldest);
}

/** Advances a buffered response without allowing a large network chunk to dump at once. */
export function advanceBufferedText(visible: string, target: string): string {
  if (!target.startsWith(visible)) return target;
  const visibleParts = graphemes(visible);
  const targetParts = graphemes(target);
  const remaining = targetParts.length - visibleParts.length;
  if (remaining <= 0) return target;
  const step = Math.min(8, Math.max(1, Math.ceil(remaining / 12)));
  return targetParts.slice(0, visibleParts.length + step).join("");
}

export interface UseBufferedAgentTextOptions {
  active: boolean;
  resetKey: string;
  frameMs?: number;
}

export function useBufferedAgentText(
  text: string,
  { active, resetKey, frameMs = 20 }: UseBufferedAgentTextOptions,
): string {
  const [visible, setVisible] = useState(() =>
    active ? (bufferedTextCache.get(resetKey) ?? "") : text,
  );
  const visibleRef = useRef(visible);
  const targetRef = useRef(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousActiveRef = useRef(active);
  const drainingRef = useRef(false);

  useEffect(() => {
    const cached = bufferedTextCache.get(resetKey);
    const next =
      active && cached && text.startsWith(cached) ? cached : active ? "" : text;
    if (!active) {
      drainingRef.current = false;
    }
    previousActiveRef.current = active;
    visibleRef.current = next;
    targetRef.current = text;
    setVisible(next);
  }, [resetKey]);

  useEffect(() => {
    targetRef.current = text;
    const wasActive = previousActiveRef.current;
    previousActiveRef.current = active;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      drainingRef.current = false;
      visibleRef.current = text;
      remember(resetKey, text);
      setVisible(text);
      return;
    }

    const hasBufferedRemainder =
      visibleRef.current !== text && text.startsWith(visibleRef.current);
    if (wasActive && !active && hasBufferedRemainder) {
      drainingRef.current = true;
    }
    if (!active && !drainingRef.current) {
      visibleRef.current = text;
      remember(resetKey, text);
      setVisible(text);
      return;
    }

    const tick = () => {
      const next = advanceBufferedText(visibleRef.current, targetRef.current);
      visibleRef.current = next;
      remember(resetKey, next);
      setVisible(next);
      if (next !== targetRef.current) {
        timerRef.current = setTimeout(tick, frameMs);
      } else {
        drainingRef.current = false;
        timerRef.current = undefined;
      }
    };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(tick, frameMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, frameMs, resetKey, text]);

  return visible;
}

export interface AgentStreamingTextProps {
  text: string;
  active: boolean;
  resetKey: string;
  frameMs?: number;
  children?: (visibleText: string) => ReactNode;
}

export function AgentStreamingText({
  text,
  active,
  resetKey,
  frameMs,
  children,
}: AgentStreamingTextProps) {
  const visibleText = useBufferedAgentText(text, {
    active,
    resetKey,
    frameMs,
  });
  return children ? children(visibleText) : <Fragment>{visibleText}</Fragment>;
}
