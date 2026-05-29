import { test, expect } from "@playwright/test";

test.describe("Tool Navigation E2E", () => {
  test("homepage shows tool links", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    const toolLinks = page.locator("a[href*=\'/tools/\']");
    await expect(toolLinks.first()).toBeVisible({ timeout: 5000 });
    const count = await toolLinks.count();
    expect(count).toBeGreaterThan(5);
  });

  test("can navigate to tool page", async ({ page }) => {
    await page.goto("/en");
    const toolLinks = page.locator("a[href*=\'/tools/\']");
    await toolLinks.first().click();
    await expect(page).toHaveURL(/\/tools\//);
  });

  test("navbar contains links", async ({ page }) => {
    await page.goto("/en");
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("footer contains tool links", async ({ page }) => {
    await page.goto("/en");
    const footerLinks = page.locator("footer a[href*=\'/tools/\']");
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("can load sample tool pages", async ({ page }) => {
    for (const tool of ["pdf-merge-split", "json-formatter", "qrcode-generator"]) {
      await page.goto("/en/tools/" + tool);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });
});
