import { lazy, Suspense } from "react";

const ChatRouteContent = lazy(
  () => import("@/components/chat/ChatRouteContent"),
);

export { meta } from "./home";

export default function ChatThreadRoute() {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="flex h-full min-h-0 items-end justify-center overflow-hidden bg-background px-4 pb-4"
        >
          <div className="h-28 w-full max-w-3xl animate-pulse rounded-3xl bg-muted/40" />
        </div>
      }
    >
      <ChatRouteContent />
    </Suspense>
  );
}
