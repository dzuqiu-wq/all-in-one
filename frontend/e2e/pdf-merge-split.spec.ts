import { test, expect } from "@playwright/test";

test.describe("PDF Merge & Split Tool E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
  });

  test("page loads correctly", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /PDF Merge/i })).toBeVisible();
  });

  test("shows merge mode by default", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Merge PDFs/i })).toBeVisible();
  });

  test("can switch to split mode", async ({ page }) => {
    const splitButton = page.getByRole("button", { name: /split/i });
    await splitButton.click();
    await page.waitForTimeout(500);
    const input = page.locator("input[type=text], input[placeholder*=\'page\']").first();
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test("displays drop zone", async ({ page }) => {
    const dropZone = page.locator("[class*=\'dropzone\'], [class*=\'upload\']").first();
    await expect(dropZone).toBeVisible();
  });

  test("try sample button works", async ({ page }) => {
    const sampleButton = page.getByRole("button", { name: /sample/i });
    await sampleButton.click();
    await page.waitForTimeout(1500);
    await expect(page.locator("[class*=\'file-list\'], [class*=\'pdf-item\']").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("PDF Preview Functionality", () => {
  test("preview button appears after file upload", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    const sampleButton = page.getByRole("button", { name: /sample/i });
    await sampleButton.click();
    await page.waitForTimeout(1500);
    const previewButton = page.locator("button[title=\'Preview\']").first();
    await expect(previewButton).toBeVisible({ timeout: 5000 });
  });

  test("preview modal opens", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    const sampleButton = page.getByRole("button", { name: /sample/i });
    await sampleButton.click();
    await page.waitForTimeout(1500);
    const previewButton = page.locator("button[title=\'Preview\']").first();
    await previewButton.click();
    await page.waitForTimeout(500);
    await expect(page.locator("img[alt*=\'Page\']").first()).toBeVisible({ timeout: 3000 });
  });
});
