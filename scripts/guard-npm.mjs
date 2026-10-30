#!/usr/bin/env node
// Refuses to run install if invoked via npm or yarn.
// GASFlow uses pnpm workspaces (see master plan §2).
// Written in Node (not bash) so it works identically on Windows / macOS / Linux
// without any shell-quoting or CRLF issues.

const agent = process.env.npm_config_user_agent || "";

if (agent.startsWith("pnpm/")) {
  process.exit(0);
}

if (agent.startsWith("npm/") || agent.startsWith("yarn/")) {
  const pm = agent.split("/")[0];
  console.error(
    `ERROR: this repo uses pnpm, not ${pm}. Run: corepack enable && pnpm install`
  );
  process.exit(1);
}

// Empty (direct invocation outside a package manager) or unknown: allow.
process.exit(0);