import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    // Escape hatch for sandboxes where Playwright's bundled browser is absent:
    // set PW_EXECUTABLE_PATH to a Chromium binary. Unused on normal machines.
    ...(process.env.PW_EXECUTABLE_PATH
      ? { launchOptions: { executablePath: process.env.PW_EXECUTABLE_PATH, args: ["--no-sandbox"] } }
      : {}),
  },
  // Auto-start the app for `npm run test:e2e` (reuses an already-running one).
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
