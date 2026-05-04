import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const home = process.env.HOME || process.env.USERPROFILE || "/tmp";
const markerDir = join(home, ".claude-smart-search");

mkdirSync(markerDir, { recursive: true });

writeFileSync(join(markerDir, "ready"), new Date().toISOString());
