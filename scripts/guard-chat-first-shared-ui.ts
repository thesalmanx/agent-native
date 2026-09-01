import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const roots = [
  "packages/dispatch/src/components/layout",
  "packages/desktop-app/src/renderer/components",
];

const violations = roots.flatMap((root) => {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch (error) {
    throw new Error(`[guard:chat-first-shared-ui] Unable to read ${root}`, {
      cause: error,
    });
  }
  return entries
    .filter(
      (entry) => /chat-first/i.test(entry) && /\.(tsx?|jsx?)$/.test(entry),
    )
    .map((entry) => relative(process.cwd(), join(root, entry)));
});

const chatSidebarPath = "templates/chat/app/components/layout/Sidebar.tsx";
let chatSidebar: string;
try {
  chatSidebar = readFileSync(chatSidebarPath, "utf8");
} catch (error) {
  throw new Error(
    `[guard:chat-first-shared-ui] Unable to read ${chatSidebarPath}`,
    { cause: error },
  );
}

const chatRailViolations = [
  chatSidebar.includes("<SidebarFooterActions")
    ? "Chat rail must not restore the generic footer action stack"
    : null,
  chatSidebar.includes('href: "/settings"')
    ? "Chat rail Settings belongs in the workspace switcher, not a standalone nav row"
    : null,
  !chatSidebar.includes("{searchButton}\n            {collapseButton}")
    ? "Expanded Chat rail must keep search and collapse together in the top utility area"
    : null,
  !chatSidebar.includes("compact={collapsed}") ||
  !chatSidebar.includes('currentAppId="chat"')
    ? "Chat rail must keep the compact workspace switcher available in both rail states"
    : null,
].filter((violation): violation is string => Boolean(violation));

if (violations.length > 0 || chatRailViolations.length > 0) {
  console.error(
    [
      violations.length > 0
        ? `duplicate host component file(s):\n${violations.map((file) => `- ${file}`).join("\n")}\nMove the React implementation into packages/core/src/client/chat-first/.`
        : null,
      chatRailViolations.length > 0
        ? `Chat rail contract violation(s):\n${chatRailViolations.map((violation) => `- ${violation}`).join("\n")}`
        : null,
    ]
      .filter(Boolean)
      .map((message) => `[guard:chat-first-shared-ui] ${message}`)
      .join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log("[guard:chat-first-shared-ui] clean");
}
