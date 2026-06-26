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

  // The whole point of the i18n work: every language renders and tags <html lang>.
  const LANGS = [
    { loc: "ru", hero: "всегда под рукой" },
    { loc: "en", hero: "always at hand" },
    { loc: "id", hero: "selalu dalam genggaman" },
    { loc: "uz", hero: "doimo qoʻl ostida" },
  ];
  for (const { loc, hero } of LANGS) {
    test(`landing renders in ${loc} with <html lang="${loc}">`, async ({
      page,
      context,
      baseURL,
    }) => {
      await useLocale(context, baseURL, loc);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", loc);
      await expect(page.getByText(hero)).toBeVisible();
    });
  }
});
