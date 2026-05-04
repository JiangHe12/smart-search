import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const pluginData =
  process.env.CLAUDE_PLUGIN_DATA || join(process.env.TMPDIR || "/tmp", "smart-search");
const markerDir = join(pluginData, "markers");

mkdirSync(markerDir, { recursive: true });

const markerFile = join(markerDir, "ready");

writeFileSync(markerFile, new Date().toISOString());
