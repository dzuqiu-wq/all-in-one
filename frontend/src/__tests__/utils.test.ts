import { describe, it, expect } from "vitest";
import { formatBytes, isValidFileExtension } from "@/lib/utils";

describe("formatBytes", () => {
  it("formats bytes less than 1KB", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats bytes in KB range", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10240)).toBe("10.0 KB");
  });

  it("formats bytes in MB range", () => {
    expect(formatBytes(1048576)).toBe("1.00 MB");
    expect(formatBytes(5242880)).toBe("5.00 MB");
  });
});

describe("isValidFileExtension", () => {
  it("returns true for valid extensions", () => {
    expect(isValidFileExtension("test.docx", ["docx", "doc"])).toBe(true);
    expect(isValidFileExtension("test.pdf", ["pdf"])).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isValidFileExtension("test.DOCX", ["docx"])).toBe(true);
    expect(isValidFileExtension("TEST.PDF", ["pdf"])).toBe(true);
  });

  it("returns false for invalid extensions", () => {
    expect(isValidFileExtension("test.exe", ["docx"])).toBe(false);
    expect(isValidFileExtension("noextension", ["pdf"])).toBe(false);
  });

  it("handles files without extension", () => {
    expect(isValidFileExtension("noextension", ["pdf"])).toBe(false);
  });
});
