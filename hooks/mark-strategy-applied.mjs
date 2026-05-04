import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const home = process.env.USERPROFILE || process.env.HOME || "/tmp";
const markerDir = join(home, ".claude-smart-search");

mkdirSync(markerDir, { recursive: true });

// Legacy compatibility fallback. The PreToolUse hook now creates this marker itself.
writeFileSync(join(markerDir, "ready"), new Date().toISOString());
