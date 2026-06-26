import { test, expect } from "@playwright/test";

// Full authenticated journey: signup -> member -> document -> share -> anonymous view.
//
// GATED: this creates a REAL account and real data in the connected Supabase
// project, needs the network to reach Supabase, and requires email confirmation
// to be OFF (so signup returns a session). Run it explicitly:
//
//   RUN_AUTH_E2E=1 npm run test:e2e
//
// It is skipped by default so the no-auth smoke suite stays side-effect free.
const RUN = process.env.RUN_AUTH_E2E === "1";

test.describe("authenticated journey", () => {
  test.describe.configure({ mode: "serial" });

  (RUN ? test : test.skip)(
    "signup -> member -> document -> share -> anonymous view",
    async ({ page, context, browser, baseURL }) => {
      test.setTimeout(120_000);
      const base = baseURL ?? "http://localhost:3000";
      await context.addCookies([{ name: "locale", value: "en", url: base }]);
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);

      const email = `e2e.${Date.now()}@example.com`;
      const password = "E2ePass12345";

      // 1. Sign up (needs email confirmation OFF to receive a session)
      await page.goto("/login");
      await page.getByRole("button", { name: "Sign up", exact: true }).click();
      await page.fill("#email", email);
      await page.fill("#password", password);
      for (const box of await page.locator('form input[type="checkbox"]').all()) {
        await box.check();
      }
      await page.getByRole("button", { name: "Create account", exact: true }).click();
      await expect(
        page,
        "signup should land on /my — requires email confirmation to be OFF"
      ).toHaveURL(/\/my/, { timeout: 20_000 });

      // 2. Add a family member
      await page.fill('input[name="full_name"]', "E2E Tester");
      await page.getByRole("button", { name: "Add", exact: true }).click();
      const memberLink = page.locator('a[href^="/my/members/"]').first();
      await expect(memberLink).toBeVisible({ timeout: 15_000 });
      await memberLink.click();

      // 3. Add a document (metadata only, no file upload)
      await page.getByText("+ Add document").click();
      await page.getByPlaceholder("Passport", { exact: true }).fill("E2E Passport");
      await page.getByRole("button", { name: "Save document", exact: true }).click();
      await expect(page).toHaveURL(/\/my\/documents\//, { timeout: 20_000 });

      // 4. Create a share link and copy it
      await page.getByRole("button", { name: "Create link", exact: true }).click();
      const copyBtn = page.getByRole("button", { name: "Copy link", exact: true }).first();
      await expect(copyBtn).toBeVisible({ timeout: 15_000 });
      await copyBtn.click();
      const shareUrl: string = await page.evaluate(() => navigator.clipboard.readText());
      expect(shareUrl).toMatch(/\/s\//);

      // 5. Open the share link as an anonymous visitor
      const anon = await browser.newContext();
      const anonPage = await anon.newPage();
      await anonPage.goto(shareUrl.replace(/^https?:\/\/[^/]+/, base));
      await expect(anonPage.getByText("E2E Passport")).toBeVisible({ timeout: 15_000 });
      await anon.close();
    }
  );
});
