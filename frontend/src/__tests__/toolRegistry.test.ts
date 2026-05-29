import { describe, it, expect } from "vitest";
import { TOOLS, CATEGORIES, getTool, getRelatedTools, type ToolSlug } from "@/lib/toolRegistry";

describe("TOOLS registry", () => {
  it("has 18 tools", () => {
    expect(TOOLS).toHaveLength(18);
  });

  it("each tool has required fields", () => {
    TOOLS.forEach((tool) => {
      expect(tool.slug).toBeDefined();
      expect(tool.href).toBeDefined();
      expect(tool.intlKey).toBeDefined();
      expect(tool.category).toBeDefined();
      expect(tool.runtime).toBeDefined();
      expect(tool.icon).toBeDefined();
    });
  });

  it("all slugs are unique", () => {
    const slugs = TOOLS.map((t) => t.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("href matches slug format", () => {
    TOOLS.forEach((tool) => {
      expect(tool.href).toBe(`/tools/${tool.slug}`);
    });
  });

  it("categories are valid", () => {
    const validCategories = ["digital-legal", "crypto-financial", "pixel-image", "developer"];
    TOOLS.forEach((tool) => {
      expect(validCategories).toContain(tool.category);
    });
  });

  it("runtime is client or server", () => {
    TOOLS.forEach((tool) => {
      expect(["client", "server"]).toContain(tool.runtime);
    });
  });
});

describe("CATEGORIES registry", () => {
  it("has 4 categories", () => {
    expect(CATEGORIES).toHaveLength(4);
  });

  it("each category has required fields", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.intlKey).toBeDefined();
      expect(cat.icon).toBeDefined();
    });
  });

  it("category IDs are unique", () => {
    const ids = CATEGORIES.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("getTool", () => {
  it("returns tool by slug", () => {
    const tool = getTool("pdf-merge-split");
    expect(tool.slug).toBe("pdf-merge-split");
  });

  it("throws for unknown slug", () => {
    expect(() => getTool("unknown-tool" as ToolSlug)).toThrow();
  });
});

describe("getRelatedTools", () => {
  it("returns related tools for a given tool", () => {
    const related = getRelatedTools("pdf-merge-split", 3);
    expect(related.length).toBeLessThanOrEqual(3);
  });

  it("does not include the current tool", () => {
    const related = getRelatedTools("word-to-pdf");
    expect(related.some((t) => t.slug === "word-to-pdf")).toBe(false);
  });

  it("prioritizes same-category tools", () => {
    const related = getRelatedTools("word-to-pdf");
    const sameCategory = TOOLS.filter((t) => t.category === "digital-legal" && t.slug !== "word-to-pdf");
    // First items should be from same category if available
    if (sameCategory.length > 0) {
      expect(related[0]?.category).toBe("digital-legal");
    }
  });
});
