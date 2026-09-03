import { ClientOnly } from "@agent-native/core/client/ui";

import ChatRouteContent from "@/components/chat/ChatRouteContent";

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

export { meta } from "./home";

export default function ChatThreadRoute() {
  return (
    <ClientOnly fallback={<ChatRouteFallback />}>
      <ChatRouteContent />
    </ClientOnly>
  );
}
