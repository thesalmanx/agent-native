import { createRequire } from "node:module";

import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];
const appRequire = createRequire(import.meta.url);
const coreRequire = createRequire(
  appRequire.resolve("@agent-native/core/vite"),
);

export default defineConfig({
  optimizeDeps: {
    // React Router discovers the Chat route after Vite's default HTML crawl.
    // Scan its source up front so the first authenticated handoff cannot be
    // interrupted by a sequence of dependency-optimizer reloads.
    entries: ["app/**/*.{ts,tsx}"],
    // AgentKit reaches these Toolkit exports through its packaged React graph,
    // which Vite's source scan does not traverse. Keep the list scoped to the
    // Chat surface rather than pre-bundling Toolkit's unrelated app modules.
    include: [
      "@agent-native/toolkit/clipboard",
      "@agent-native/toolkit/composer",
      "@agent-native/toolkit/composer/PastedTextChip",
      "@agent-native/toolkit/composer/attachment-accept",
      "@agent-native/toolkit/composer/model-selection",
      "@agent-native/toolkit/composer/pasted-text",
      "@agent-native/toolkit/composer/realtime-voice-transcript",
      "@agent-native/toolkit/design-system",
      "@agent-native/toolkit/editor/SharedRichEditor",
      "@agent-native/toolkit/markdown-block-split",
      "@agent-native/toolkit/sharing",
      "@agent-native/toolkit/streaming-text-smoothing",
      "@agent-native/toolkit/ui/alert-dialog",
      "@agent-native/toolkit/ui/avatar",
      "@agent-native/toolkit/ui/badge",
      "@agent-native/toolkit/ui/button",
      "@agent-native/toolkit/ui/checkbox",
      "@agent-native/toolkit/ui/command",
      "@agent-native/toolkit/ui/cube-loader",
      "@agent-native/toolkit/ui/dialog",
      "@agent-native/toolkit/ui/dropdown-menu",
      "@agent-native/toolkit/ui/hover-card",
      "@agent-native/toolkit/ui/input",
      "@agent-native/toolkit/ui/pagination",
      "@agent-native/toolkit/ui/popover",
      "@agent-native/toolkit/ui/select",
      "@agent-native/toolkit/ui/sheet",
      "@agent-native/toolkit/ui/sonner",
      "@agent-native/toolkit/ui/spinner",
      "@agent-native/toolkit/ui/switch",
      "@agent-native/toolkit/ui/textarea",
      "@agent-native/toolkit/ui/tooltip",
      "@agent-native/toolkit/utils",
    ],
  },
  resolve: {
    // Core and toolkit both use assistant-ui contexts. Keep published and
    // linked graphs on one store so the agent sidebar can compose reliably.
    dedupe: [
      "@assistant-ui/react",
      "@assistant-ui/core",
      "@assistant-ui/store",
      "@assistant-ui/tap",
    ],
    alias: [
      {
        find: /^@assistant-ui\/react$/,
        replacement: coreRequire.resolve("@assistant-ui/react"),
      },
      {
        find: /^@assistant-ui\/core$/,
        replacement: coreRequire.resolve("@assistant-ui/core"),
      },
      {
        find: /^@assistant-ui\/store$/,
        replacement: coreRequire.resolve("@assistant-ui/store"),
      },
      {
        find: /^@assistant-ui\/tap$/,
        replacement: coreRequire.resolve("@assistant-ui/tap"),
      },
      {
        find: /^assistant-stream$/,
        replacement: coreRequire.resolve("assistant-stream"),
      },
      {
        find: /^assistant-stream\/utils$/,
        replacement: coreRequire.resolve("assistant-stream/utils"),
      },
    ],
  },
  plugins: [
    ...reactRouterPlugins(),
    ...agentNativePlugins({
      // shiki only runs in AssistantChat's useEffect — keep it out of the
      // CF Pages Functions bundle (25 MiB limit).
      ssrStubs: ["shiki"],
    }),
  ],
});
