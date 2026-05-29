import { describe, it, expect } from "vitest";
import { SAMPLE_TAG } from "@/lib/sampleData";

describe("sampleData", () => {
  describe("SAMPLE_TAG", () => {
    it("is defined as a string", () => {
      expect(typeof SAMPLE_TAG).toBe("string");
      expect(SAMPLE_TAG.length).toBeGreaterThan(0);
    });

    it("contains identifying marker", () => {
      expect(SAMPLE_TAG).toContain("sample");
      expect(SAMPLE_TAG).toContain("all-in-one");
    });
  });

  describe("buildSamplePdfFile", () => {
    it("is a function", async () => {
      const { buildSamplePdfFile } = await import("@/lib/sampleData");
      expect(typeof buildSamplePdfFile).toBe("function");
    });

    it("returns a File object with PDF type", async () => {
      const { buildSamplePdfFile } = await import("@/lib/sampleData");
      const file = await buildSamplePdfFile({ title: "Test", variant: "a", pageCount: 1 });
      expect(file).toBeInstanceOf(File);
      expect(file.type).toBe("application/pdf");
    });

    it("creates file with correct name pattern", async () => {
      const { buildSamplePdfFile } = await import("@/lib/sampleData");
      const file = await buildSamplePdfFile({ title: "Invoice", variant: "a", pageCount: 2 });
      expect(file.name).toMatch(/\.pdf$/i);
    });
  });
});
