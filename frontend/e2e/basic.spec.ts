import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('homepage redirects to /en', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(en|zh)/);
  });

  test('English homepage loads', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Chinese homepage loads', async ({ page }) => {
    await page.goto('/zh');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Tool Pages', () => {
  const tools = [
    'word-to-pdf',
    'pdf-merge-split',
    'qrcode-generator',
    'image-optimizer',
  ];

  for (const tool of tools) {
    test(`${tool} page loads in English`, async ({ page }) => {
      await page.goto(`/en/tools/${tool}`);
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test(`${tool} page loads in Chinese`, async ({ page }) => {
      await page.goto(`/zh/tools/${tool}`);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});