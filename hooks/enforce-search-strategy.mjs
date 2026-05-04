import { existsSync, mkdirSync, readFileSync, appendFileSync } from "fs";
import { join } from "path";

const home = process.env.HOME || process.env.USERPROFILE || "/tmp";
const markerDir = join(home, ".claude-smart-search");
const markerFile = join(markerDir, "ready");

// Debug log
const debugLine = `[${new Date().toISOString()}] home=${home} markerFile=${markerFile} exists=${existsSync(markerFile)}\n`;
try { appendFileSync(join(markerDir, "debug.log"), debugLine); } catch {}

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

mkdirSync(markerDir, { recursive: true });

const toolName = input.tool_name || process.env.CLAUDE_TOOL_NAME || "unknown";
const toolSuffix = toolName === "unknown" ? "" : ` (${toolName})`;
const output = JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `You must invoke the /smart-search:search skill before using any search tool${toolSuffix}. Follow the skill's workflow, then retry.`,
  },
});

process.stdout.write(output);
process.exit(0);
