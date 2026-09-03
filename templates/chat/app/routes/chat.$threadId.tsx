import { useEffect, useState, type ComponentType } from "react";

function ChatRouteFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-h-0 items-end justify-center overflow-hidden bg-background px-4 pb-4"
    >
      <div className="h-28 w-full max-w-3xl animate-pulse rounded-3xl bg-muted/40" />
    </div>
  );
}

let chatRouteContentPromise:
  | Promise<typeof import("@/components/chat/ChatRouteContent")>
  | undefined;

function loadChatRouteContent() {
  return (chatRouteContentPromise ??=
    import("@/components/chat/ChatRouteContent"));
}

function ClientChatRoute() {
  const [ChatRouteContent, setChatRouteContent] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadChatRouteContent().then((module) => {
      if (!cancelled) setChatRouteContent(() => module.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ChatRouteContent ? <ChatRouteContent /> : <ChatRouteFallback />;
}

export { meta } from "./home";

export default function ChatThreadRoute() {
  return <ClientChatRoute />;
}
