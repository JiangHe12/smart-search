import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const pluginData =
  process.env.CLAUDE_PLUGIN_DATA || join(process.env.TMPDIR || "/tmp", "smart-search");
const markerDir = join(pluginData, "markers");

mkdirSync(markerDir, { recursive: true });

const sessionKey = process.argv[2] || "default";
let hash = 0;
for (let i = 0; i < sessionKey.length; i++) {
  hash = (hash * 31 + sessionKey.charCodeAt(i)) | 0;
}
const markerFile = join(markerDir, Math.abs(hash).toString(36));

writeFileSync(markerFile, new Date().toISOString());
