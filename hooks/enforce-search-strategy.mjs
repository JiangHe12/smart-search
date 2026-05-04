import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const pluginData =
  process.env.CLAUDE_PLUGIN_DATA || join(process.env.TMPDIR || "/tmp", "smart-search");
const markerDir = join(pluginData, "markers");

function getSessionKey() {
  try {
    const stdin = readFileSync(0, "utf-8");
    const input = JSON.parse(stdin);
    return input.session_id || input.transcript_path || "default";
  } catch {
    return "default";
  }
}

function hashKey(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

const sessionKey = getSessionKey();
const markerFile = join(markerDir, hashKey(sessionKey));

if (existsSync(markerFile)) {
  process.exit(0);
}

mkdirSync(markerDir, { recursive: true });

const toolName = process.env.CLAUDE_TOOL_NAME || "unknown";
const output = JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `You must invoke the /smart-search:search skill before using any search tool (${toolName}). Follow the skill's workflow, then retry.`,
  },
});

process.stdout.write(output);
process.exit(0);
