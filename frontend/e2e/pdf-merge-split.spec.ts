import { test, expect } from "@playwright/test";

test.describe("PDF Merge & Split Tool E2E", () => {
  test("page loads correctly", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /PDF Merge/i })).toBeVisible();
  });

  test("shows merge mode by default", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    await expect(page.getByRole("button", { name: /Merge PDFs/i })).toBeVisible();
  });

  test("has split mode toggle", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    const splitButton = page.getByRole("button", { name: /split/i });
    await expect(splitButton).toBeVisible();
  });

  test("has file upload area", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    const uploadArea = page.locator("input[type=file]");
    await expect(uploadArea).toBeAttached();
  });
});
