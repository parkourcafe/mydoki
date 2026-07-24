import { spawnSync } from "node:child_process";
import path from "node:path";

const action = process.argv[2] || "sync";
const capActions = {
  add: ["add", "android"],
  open: ["open", "android"],
  sync: ["sync", "android"],
};

const env = {
  ...process.env,
  CAP_APP_ID: "help.doki.app",
  CAP_APP_NAME: "doki.help",
  CAP_SERVER_URL: process.env.CAP_GOOGLE_PLAY_SERVER_URL || "https://www.doki.help",
  CAP_USER_AGENT: "DokiHelpAndroid/GP/1.0.2",
  CAP_GOOGLE_PLAY: "true",
};

let executable;
let args;
if (action === "assets") {
  executable = path.resolve("node_modules/.bin/capacitor-assets");
  args = ["generate", "--android"];
} else if (capActions[action]) {
  executable = path.resolve("node_modules/.bin/cap");
  args = capActions[action];
} else {
  console.error(`Unknown Google Play action: ${action}`);
  process.exit(2);
}

const result = spawnSync(executable, args, { env, stdio: "inherit" });
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
