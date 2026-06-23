import { test, expect } from "@playwright/test";

// Дымовые E2E без авторизации. Запуск против запущенного приложения:
//   BASE_URL=http://localhost:3000 npm run test:e2e

test("страница входа отображается", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Family Vault" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
});

test("неавторизованный /my редиректит на /login", async ({ page }) => {
  await page.goto("/my");
  await expect(page).toHaveURL(/\/login$/);
});

test("недействительная share-ссылка показывает ошибку", async ({ page }) => {
  await page.goto("/s/definitely-not-a-real-token");
  await expect(page.getByText("Ссылка недействительна")).toBeVisible();
});
