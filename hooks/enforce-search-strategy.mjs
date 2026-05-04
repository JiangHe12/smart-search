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
    permissionDecision: "allow",
    permissionDecisionReason: `Smart Search strategy reminder for ${toolName === "unknown" ? "this search tool" : toolName}: apply /smart-search:search guidance while using search results. Use the smallest search depth that answers safely; escalate to Tavily only when page content is needed.`,
  },
});

process.stdout.write(output);
process.exit(0);
