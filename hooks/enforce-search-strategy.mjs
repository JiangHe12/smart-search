import { existsSync, mkdirSync, readFileSync } from "fs";
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
      permissionDecisionReason: "Smart Search strategy has already been applied for this session.",
    },
  });
  process.stdout.write(output);
  process.exit(0);
}

mkdirSync(markerDir, { recursive: true });

const toolName = input.tool_name || process.env.CLAUDE_TOOL_NAME || "unknown";
const toolSuffix = toolName === "unknown" ? "" : ` (${toolName})`;
const output = JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `Smart Search session activation is missing. Before using any search tool${toolSuffix}, invoke /smart-search:search, complete its checklist, run the final activation command shown at the end of the skill, then retry the search.`,
  },
});

process.stdout.write(output);
process.exit(0);
