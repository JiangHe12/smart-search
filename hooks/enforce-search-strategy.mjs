import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const home = process.env.USERPROFILE || process.env.HOME || "/tmp";
const markerDir = join(home, ".claude-smart-search");
const markerFile = join(markerDir, "ready");
const skillLoadedMarker = "SMART_SEARCH_STRATEGY_LOADED_V1";

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
const transcriptPath = typeof input.transcript_path === "string" ? input.transcript_path : "";

function transcriptHasLoadedSkill(path) {
  if (!path) {
    return false;
  }

  try {
    return readFileSync(path, "utf-8").includes(skillLoadedMarker);
  } catch {
    return false;
  }
}

if (transcriptHasLoadedSkill(transcriptPath)) {
  try {
    mkdirSync(markerDir, { recursive: true });
    writeFileSync(markerFile, new Date().toISOString());
    process.exit(0);
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
}

const output = JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `Smart Search strategy has not been loaded for this session. Before using any search tool${toolSuffix}, invoke /smart-search:search, apply its search-depth strategy, then retry the search. After the skill is loaded once, later search calls in this session will be allowed without another interruption.`,
  },
});

process.stdout.write(output);
process.exit(0);
