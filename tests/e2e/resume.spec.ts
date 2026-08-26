import { test, expect } from "@playwright/test";

// Приватные маршруты резюме: без входа они не должны отдавать ничего, кроме
// перенаправления на вход. Проверяем именно это — данные профиля и PDF
// доступны только владельцу, и юнит-тесты чистых функций такое не ловят.

test.describe("resume routes are private", () => {
  test("editor redirects an anonymous visitor to login", async ({ page }) => {
    await page.goto("/my/resume");
    await expect(page).toHaveURL(/\/login/);
  });

  // Страницу закрывает redirect, а обработчики маршрутов отвечают 401:
  // файл не должен уехать анониму ни под каким видом.
  test("CV PDF is not served to an anonymous visitor", async ({ request }) => {
    const response = await request.get("/my/resume/pdf");
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"] ?? "").not.toContain("application/pdf");
  });

  test("JSON Resume export is not served to an anonymous visitor", async ({ request }) => {
    const response = await request.get("/my/resume/json");
    expect(response.status()).toBe(401);
  });

  test("resume parsing API rejects an anonymous request", async ({ request }) => {
    const response = await request.post("/api/resume-parse", {
      multipart: { file: { name: "cv.png", mimeType: "image/png", buffer: Buffer.from("x") } },
    });
    expect(response.status()).toBe(401);
  });
});
