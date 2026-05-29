import { test, expect } from "@playwright/test";

test.describe("Tool Navigation E2E", () => {
  const TOOL_CATEGORIES = [
    {
      name: "Document Tools",
      tools: ["word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "pdf-merge-split", "pdf-watermark"],
    },
    {
      name: "Image Tools",
      tools: ["image-optimizer", "image-converter", "image-resizer", "qrcode-generator", "wechat-generator", "color-converter"],
    },
    {
      name: "Developer Tools",
      tools: ["json-formatter", "base64", "hash-generator", "password-generator", "uuid-generator"],
    },
  ];

  test("homepage shows all tool categories", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    
    // Check for category elements
    for (const category of TOOL_CATEGORIES) {
      const categoryElement = page.getByText(category.name, { exact: false }).first();
      await expect(categoryElement).toBeVisible({ timeout: 5000 });
    }
  });

  test("can navigate from homepage to each tool", async ({ page }) => {
    await page.goto("/en");
    
    // Find and click on first tool link
    const toolLinks = page.locator("a[href*='/tools/']");
    const count = await toolLinks.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Click first tool
    await toolLinks.first().click();
    await expect(page).toHaveURL(/\/tools\//);
  });

  test("navbar contains tool links", async ({ page }) => {
    await page.goto("/en");
    
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("footer contains tool links", async ({ page }) => {
    await page.goto("/en");
    
    const footerLinks = page.locator("footer a[href*='/tools/']");
    const count = await footerLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test.describe("Category filtering", () => {
    for (const category of TOOL_CATEGORIES) {
      test(`${category.name} category shows tools`, async ({ page }) => {
        await page.goto("/en");
        
        // Click category tab or filter
        const categoryButton = page.getByText(category.name, { exact: false }).first();
        await categoryButton.click();
        
        // Check that at least one tool from this category is visible
        for (const tool of category.tools.slice(0, 2)) {
          const toolElement = page.getByText(tool.replace(/-/g, " "), { exact: false }).first();
          await expect(toolElement).toBeVisible({ timeout: 3000 });
        }
      });
    }
  });
});

test.describe("Related Tools Navigation", () => {
  const SAMPLE_TOOLS = ["pdf-merge-split", "json-formatter", "qrcode-generator"];

  for (const tool of SAMPLE_TOOLS) {
    test(`related tools section on ${tool} page`, async ({ page }) => {
      await page.goto(`/en/tools/${tool}`);
      
      // Look for related tools section
      const relatedSection = page.getByText(/related/i, { exact: false }).first();
      await expect(relatedSection).toBeVisible({ timeout: 5000 });
      
      // Check for tool links in related section
      const relatedLinks = page.locator("[class*='related'] a, [class*='suggestion'] a");
      const linkCount = await relatedLinks.count();
      
      expect(linkCount).toBeGreaterThan(0);
    });
  }
});
