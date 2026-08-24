import { test, expect, type BrowserContext } from "@playwright/test";

// Публичные смоук-проверки для фазы 1 (без авторизации). Требуют запущенное
// приложение (webServer в playwright.config). Три критических пути с
// авторизацией (загрузка документа, создание вакансии, отклик) требуют
// засеянного тест-пользователя и БД — они описаны ниже как skip и включаются
// в окружении с тестовыми данными.

async function useLocale(context: BrowserContext, baseURL: string | undefined, loc: string) {
  await context.addCookies([
    { name: "locale", value: loc, url: baseURL ?? "http://localhost:3000" },
  ]);
}

test.describe("phase 1 public pages", () => {
  test("home shows three entrances (en)", async ({ page, context, baseURL }) => {
    await useLocale(context, baseURL, "en");
    await page.goto("/");
    // Продукт сместился на найм: EN/ID теперь ведут на работодателя,
    // кандидата и объединённый поток hiring & onboarding (app/page.tsx),
    // а не на старые "For people / For families" из семейного сейфа.
    await expect(page.getByRole("link", { name: /For employers/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /For candidates/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Hiring & onboarding flow/ })).toBeVisible();
  });

  test("/about renders (en)", async ({ page, context, baseURL }) => {
    await useLocale(context, baseURL, "en");
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About doki.help" })).toBeVisible();
    await expect(
      page.getByText(/secure system for documents, hiring and employment/i)
    ).toBeVisible();
  });

  test("public vacancy page: invalid slug shows localized error (en)", async ({
    page,
    context,
    baseURL,
  }) => {
    await useLocale(context, baseURL, "en");
    await page.goto("/v/definitely-not-a-real-vacancy");
    await expect(page.getByText("Vacancy not available")).toBeVisible();
  });
});

// Три критических пути (загрузка документа / создание вакансии / отклик)
// требуют авторизованной сессии и засеянных данных. Включать в окружении
// с тестовым пользователем (storageState) и seed-скриптом.
test.describe("phase 1 authenticated critical paths (need seeded env)", () => {
  test.skip(true, "requires seeded test user + storageState");

  test("document upload creates a version", async () => {});
  test("employer creates a vacancy via wizard", async () => {});
  test("candidate applies from vault", async () => {});
});
