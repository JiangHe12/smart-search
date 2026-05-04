import { unlinkSync } from "fs";
import { join } from "path";

const home = process.env.USERPROFILE || process.env.HOME || "/tmp";
const markerFile = join(home, ".claude-smart-search", "ready");

try {
  unlinkSync(markerFile);
} catch {
  // Missing marker is the normal first-run state.
}
