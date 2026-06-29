import { test, expect, type BrowserContext } from "@playwright/test";

// Public, no-auth smoke tests. Require the app running (see `webServer` in
// playwright.config.ts). Locale is forced via the `locale` cookie so the
// assertions are deterministic regardless of the runner's Accept-Language.

async function useLocale(
  context: BrowserContext,
  baseURL: string | undefined,
  loc: string
) {
  await context.addCookies([
    { name: "locale", value: loc, url: baseURL ?? "http://localhost:3000" },
  ]);
}

test.describe("public pages", () => {
  test("login page renders (en)", async ({ page, context, baseURL }) => {
    await useLocale(context, baseURL, "en");
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Sign in with Google" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true })
    ).toBeVisible();
  });

  test("unauthenticated /my redirects to /login", async ({ page }) => {
    await page.goto("/my");
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid share link shows a localized error (en)", async ({
    page,
    context,
    baseURL,
  }) => {
    await useLocale(context, baseURL, "en");
    await page.goto("/s/definitely-not-a-real-token");
    await expect(page.getByText("Link is invalid")).toBeVisible();
  });

  // The point of the i18n work: each locale has its own URL that renders in
  // that language, tags <html lang> and emits a self-canonical. Asserted via
  // the i18n contract (lang attr, a visible <h1>, canonical) rather than exact
  // hero copy, so the test survives landing-copy changes.
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    test(`landing at /${loc} tags <html lang="${loc}"> + self-canonical`, async ({
      page,
    }) => {
      await page.goto(`/${loc}`);
      await expect(page.locator("html")).toHaveAttribute("lang", loc);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/${loc}$`)
      );
    });
  }
});
