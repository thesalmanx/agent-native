import { lazy, Suspense } from "react";

import { APP_TITLE } from "@/lib/app-config";

const ChatRouteContent = lazy(
  () => import("@/components/chat/ChatRouteContent"),
);

const SEO_TITLE = `${APP_TITLE} - Open Source AI app starter with actions`;
const SEO_DESCRIPTION =
  "Open Source starter for agent-native apps with durable chat, shared actions, UI state, tools, and a backend your agent can extend.";

export function meta() {
  return [
    { title: SEO_TITLE },
    {
      name: "description",
      content: SEO_DESCRIPTION,
    },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

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

export default function ChatRoute() {
  return (
    <Suspense fallback={<ChatRouteFallback />}>
      <ChatRouteContent />
    </Suspense>
  );
}
