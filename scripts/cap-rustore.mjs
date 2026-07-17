import { spawnSync } from "node:child_process";
import path from "node:path";

const action = process.argv[2] || "sync";
const serverUrl =
  process.env.CAP_RUSTORE_SERVER_URL ||
  "https://www.doki.help/ru/login?next=/my";
const capActions = {
  add: ["add", "android"],
  open: ["open", "android"],
  sync: ["sync", "android"],
};

const env = {
  ...process.env,
  CAP_APP_ID: "help.doki.twa",
  CAP_APP_NAME: "DOKI HELP",
  CAP_SERVER_URL: serverUrl,
  CAP_USER_AGENT: "DokiHelpAndroid/RU/1.0",
  CAP_RUSTORE: "true",
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
  console.error(`Unknown RuStore action: ${action}`);
  process.exit(2);
}

const result = spawnSync(executable, args, { env, stdio: "inherit" });
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
