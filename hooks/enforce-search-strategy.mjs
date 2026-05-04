import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const home = process.env.USERPROFILE || process.env.HOME || "/tmp";
const markerDir = join(home, ".claude-smart-search");
const markerFile = join(markerDir, "ready");

function readHookInput() {
  try {
    const stdin = readFileSync(0, "utf-8");
    return JSON.parse(stdin);
  } catch {
    return {};
  }
}

const input = readHookInput();

if (existsSync(markerFile)) {
  const output = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "Smart Search strategy reminder has already been recorded for this session.",
    },
  });
  process.stdout.write(output);
  process.exit(0);
}

const toolName = input.tool_name || process.env.CLAUDE_TOOL_NAME || "unknown";
const toolSuffix = toolName === "unknown" ? "" : ` (${toolName})`;

try {
  mkdirSync(markerDir, { recursive: true });
  writeFileSync(markerFile, new Date().toISOString());
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const output = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Smart Search could not write its session marker at ${markerFile}: ${message}`,
    },
  });
  process.stdout.write(output);
  process.exit(0);
}

const output = JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `Smart Search strategy has not been reviewed yet. Before using any search tool${toolSuffix}, invoke /smart-search:search, apply the matching search strategy, then retry the search. This reminder is recorded for the session; the next search tool call will be allowed.`,
  },
});

process.stdout.write(output);
process.exit(0);
