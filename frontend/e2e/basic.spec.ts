import { test, expect } from '@playwright/test';

const ALL_TOOLS = [
  // Document tools (server-side)
  'word-to-pdf',
  'excel-to-pdf',
  'powerpoint-to-pdf',
  // Document tools (client-side)
  'pdf-merge-split',
  'pdf-watermark',
  'invoice-generator',
  // Image tools
  'image-optimizer',
  'image-converter',
  'image-resizer',
  'qrcode-generator',
  'wechat-generator',
  'color-converter',
  // Data tools
  'data-sanitizer',
  // Developer tools
  'json-formatter',
  'base64',
  'hash-generator',
  'password-generator',
  'uuid-generator',
] as const;

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
  for (const tool of ALL_TOOLS) {
    test(`${tool} loads in English`, async ({ page }) => {
      await page.goto(`/en/tools/${tool}`);
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test(`${tool} loads in Chinese`, async ({ page }) => {
      await page.goto(`/zh/tools/${tool}`);
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});

test.describe('Sitemap', () => {
  test('sitemap.xml includes all tools in both locales', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    for (const tool of ALL_TOOLS) {
      expect(xml).toContain(`/en/tools/${tool}`);
      expect(xml).toContain(`/zh/tools/${tool}`);
    }
  });
});
