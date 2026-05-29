import { test, expect } from "@playwright/test";
import path from "path";

test.describe("PDF Merge & Split Tool E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
  });

  test("page loads correctly", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText("merge", { exact: false })).toBeVisible();
  });

  test("shows merge mode by default", async ({ page }) => {
    const mergeButton = page.getByRole("button", { name: /merge/i });
    await expect(mergeButton).toBeVisible();
  });

  test("can switch to split mode", async ({ page }) => {
    const splitButton = page.getByRole("button", { name: /split/i });
    await splitButton.click();
    await expect(page.getByPlaceholder(/page range/i)).toBeVisible();
  });

  test("displays drop zone", async ({ page }) => {
    await expect(page.getByText(/drag.*pdf.*here/i)).toBeVisible();
  });

  test("try sample button works", async ({ page }) => {
    const sampleButton = page.getByRole("button", { name: /sample/i });
    await sampleButton.click();
    // Wait for sample files to load
    await page.waitForTimeout(1000);
    // Check that files appear in the list
    await expect(page.locator("[class*=\"file\"], [class*=\"pdf\"]").first()).toBeVisible({ timeout: 5000 });
  });

  test("can upload PDF files", async ({ page }) => {
    const dropZone = page.locator("[class*=\"dropzone\"], [class*=\"upload\"]").first();
    
    // Create a minimal test PDF
    const testPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>obj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>obj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>obj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n193\n%%EOF",
      "binary"
    );

    // Note: Full upload test requires actual file input interaction
    // This is a placeholder for the upload functionality test
  });
});

test.describe("PDF Preview Functionality", () => {
  test("preview button appears after file upload", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    
    // Load sample
    const sampleButton = page.getByRole("button", { name: /sample/i });
    await sampleButton.click();
    await page.waitForTimeout(1500);
    
    // Look for preview (eye) icon
    const previewButton = page.locator("[title=\"Preview\"], [aria-label=\"Preview\"]").first();
    await expect(previewButton).toBeVisible({ timeout: 5000 });
  });

  test("preview modal opens", async ({ page }) => {
    await page.goto("/en/tools/pdf-merge-split");
    
    // Load sample and click preview
    const sampleButton = page.getByRole("button", { name: /sample/i });
    await sampleButton.click();
    await page.waitForTimeout(1500);
    
    const previewButton = page.locator("[title=\"Preview\"]").first();
    await previewButton.click();
    
    // Modal should open
    await expect(page.locator("[class*=\"modal\"], [class*=\"preview\"]").first()).toBeVisible({ timeout: 3000 });
  });
});
