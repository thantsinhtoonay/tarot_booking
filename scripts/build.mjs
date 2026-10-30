import { spawnSync } from "node:child_process";

const result = spawnSync("next", ["build", "--webpack"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, NEXT_PRIVATE_BUILD_WORKER: "1" },
});

process.exit(result.status ?? 1);
