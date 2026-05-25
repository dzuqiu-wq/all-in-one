"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { Download, FileText, Merge, Scissors, X, GripVertical, CheckCircle } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import SampleButton from "@/components/SampleButton";
import ShareButtons from "@/components/ShareButtons";
import { buildSamplePdfFile } from "@/lib/sampleData";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  version: string;
}

type Mode = "merge" | "split";

// Structured data for SEO
function StructuredDataEN() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PDF Merge & Split Tool",
            operatingSystem: "All",
            applicationCategory: "BusinessApplication",
            browserRequirements: "Requires HTML5 Canvas API and File API support",
            url: "https://333654.xyz/tools/pdf-merge-split",
            description: "Merge multiple PDF files into one document or extract specific pages from PDF files. Pure client-side processing using pdf-lib library — files never leave your browser.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is my file secure?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely. All processing happens in your browser using the pdf-lib library for PDF operations. Your files are processed locally through Canvas API and File API, never leaving your device, never uploaded to any server.",
                },
              },
              {
                "@type": "Question",
                name: "What operations are supported?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can merge multiple PDF files into a single document, or extract specific pages from a single PDF. The merge feature supports drag-and-drop reordering. The split feature supports flexible page range syntax.",
                },
              },
              {
                "@type": "Question",
                name: "Is there a file size limit?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We recommend keeping individual files under 50MB. Larger files may cause browser performance issues due to memory-intensive PDF processing.",
                },
              },
              {
                "@type": "Question",
                name: "How fast is the processing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Processing speed depends on your device performance, file size, and page count. Most operations complete within seconds using efficient streaming algorithms.",
                },
              },
              {
                "@type": "Question",
                name: "Will merged PDFs have watermarks?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, we do not add any watermarks, logos, or advertisements to merged PDFs. You will receive completely clean documents.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}

function _StructuredDataZH() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PDF 合并与拆分工具",
            operatingSystem: "All",
            applicationCategory: "BusinessApplication",
            browserRequirements: "Requires HTML5 Canvas API and File API support",
            url: "https://333654.xyz/zh/tools/pdf-merge-split",
            description: "合并多个 PDF 或提取文档中的特定页面。纯浏览器端处理，无需上传文件。100%隐私保护，完全免费无限制使用。",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "我的文件安全吗？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "绝对安全。所有处理都在您的浏览器中完成，使用 pdf-lib 库进行 PDF 操作。您的文件通过 Canvas API 和 File API 在本地处理，从不离开您的设备，从不上传到任何服务器。",
                },
              },
              {
                "@type": "Question",
                name: "支持哪些操作？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "您可以合并多个 PDF 文件为一个，或从单个 PDF 中提取特定页面。合并功能支持拖拽重新排序文件。拆分功能支持灵活的页面范围语法。",
                },
              },
              {
                "@type": "Question",
                name: "有文件大小限制吗？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "我们建议将单个文件保持在 50MB 以下。更大型的文件可能会因浏览器内存密集型的 PDF 处理而导致的性能问题。",
                },
              },
              {
                "@type": "Question",
                name: "处理速度如何？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "处理速度取决于您的设备性能、文件大小和页面数量。大多数操作在几秒内完成，使用高效的流式算法处理 PDF。",
                },
              },
              {
                "@type": "Question",
                name: "合并后的 PDF 会有水印吗？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "不会，我们不会在合并后的 PDF 上添加任何水印、徽标或广告。您将收到完全干净的文档。",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}

export default function PDFMergeSplitPage() {
  const t = useTranslations("tools.pdfMerge");
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [splitRanges, setSplitRanges] = useState("1");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsePDF = async (file: File): Promise<PDFFile> => {
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    // Slice to a fresh ArrayBuffer so the Uint8Array has an exact-typed buffer
    // regardless of which TypeScript / lib.dom version is in scope.
    const headerBuf = buf.slice(0, 8);
    const header = new TextDecoder().decode(new Uint8Array(headerBuf));
    const ver = header.match(/\d\.\d/);
    return {
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      pageCount: doc.getPageCount(),
      version: ver ? `1.${ver[0].split(".")[1]}` : "1.7",
    };
  };

  const handleFilesAdd = useCallback(async (selected: FileList | null) => {
    if (!selected) return;
    const newFiles: PDFFile[] = [];
    for (const f of Array.from(selected)) {
      if (f.type === "application/pdf") {
        try { newFiles.push(await parsePDF(f)); } catch {}
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
  }, []);

  const handleLoadSample = useCallback(async () => {
    const samples =
      mode === "merge"
        ? await Promise.all([
            buildSamplePdfFile({ title: "Sample Document A", variant: "a", pageCount: 2 }),
            buildSamplePdfFile({ title: "Sample Document B", variant: "b", pageCount: 2 }),
          ])
        : [await buildSamplePdfFile({ title: "Sample Document", variant: "a", pageCount: 5 })];
    const parsed = await Promise.all(samples.map(parsePDF));
    setFiles((prev) => [...prev, ...parsed]);
    setResult(null);
    if (mode === "split") setSplitRanges("1-3");
  }, [mode]);

  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const buf = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      // pdf-lib types `save()` as Uint8Array<ArrayBufferLike>; Blob accepts
      // BlobPart, so we cast through it explicitly to keep TS 5.7+'s stricter
      // typed-array generics happy.
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  const handleSplit = async () => {
    if (files.length !== 1) return;
    setIsProcessing(true);
    setSplitError(null); // Clear previous errors

    try {
      const f = files[0];
      const buf = await f.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = doc.getPageCount();
      const pages: number[] = [];

      // Parse page ranges with proper NaN validation
      for (const p of splitRanges.split(",").map(s => s.trim())) {
        if (p.includes("-")) {
          const parts = p.split("-");
          if (parts.length !== 2) {
            throw new Error(`Invalid range format: "${p}". Use format like "1-5".`);
          }

          const start = parseInt(parts[0]);
          const end = parseInt(parts[1]);

          // CRITICAL: Explicit NaN check
          if (isNaN(start) || isNaN(end)) {
            throw new Error(`Invalid page number in range "${p}". Please enter valid page numbers.`);
          }

          // Validate range bounds
          if (start < 1 || end < 1 || start > total || end > total) {
            throw new Error(`Page range "${p}" is out of bounds. Document has ${total} pages. Valid range: 1-${total}.`);
          }

          if (start > end) {
            throw new Error(`Invalid range "${p}": start page must be less than or equal to end page.`);
          }

          for (let i = start; i <= Math.min(end, total); i++) {
            pages.push(i - 1);
          }
        } else {
          const n = parseInt(p);

          // CRITICAL: Explicit NaN check - reject invalid input
          if (isNaN(n)) {
            throw new Error(`Invalid page number "${p}". Please enter a valid page number (1-${total}).`);
          }

          // Validate bounds
          if (n < 1 || n > total) {
            throw new Error(`Page ${n} is out of bounds. Document has ${total} pages.`);
          }

          pages.push(n - 1);
        }
      }

      if (pages.length === 0) {
        throw new Error("No valid pages specified. Please enter page numbers within the document range.");
      }

      const unique = [...new Set(pages)].sort((a, b) => a - b);
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(doc, unique);
      copied.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save();
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    } catch (e) {
      console.error(e);
      setSplitError(e instanceof Error ? e.message : "Failed to split PDF. Please check your page range.");
      setResult(null);
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "merge" ? "merged.pdf" : "split.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* SEO Structured Data */}
      <StructuredDataEN />
      
      <div className="max-w-4xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="pdf-merge-split" />

        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4" style={{ fontSize: "clamp(36px, 5vw, 48px)" }}>
            {t("title")}
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="mb-8">
          <AdBanner slot="pdf-tool-top" format="auto" />
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode("merge"); setResult(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium transition-colors ${
              mode === "merge"
                ? "bg-primary text-on-primary"
                : "bg-canvas border border-hairline text-body hover:text-ink"
            }`}
          >
            <Merge className="w-4 h-4" />
            {t("merge")}
          </button>
          <button
            onClick={() => { setMode("split"); setResult(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium transition-colors ${
              mode === "split"
                ? "bg-primary text-on-primary"
                : "bg-canvas border border-hairline text-body hover:text-ink"
            }`}
          >
            <Scissors className="w-4 h-4" />
            {t("split")}
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={(e) => { e.preventDefault(); handleFilesAdd(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="surface-card border-2 border-dashed border-hairline rounded-xl p-xxl text-center cursor-pointer transition-all hover:border-primary hover:bg-surface-cream-strong"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple={mode === "merge"}
            onChange={(e) => handleFilesAdd(e.target.files)}
            className="hidden"
          />
          <FileText className="w-12 h-12 mx-auto mb-4 text-primary" strokeWidth={1.5} />
          <h4 className="text-title-md font-sans text-ink mb-2">
            {mode === "merge" ? t("dropzoneMerge") : t("dropzoneSplit")}
          </h4>
          <p className="text-body-sm text-muted">
            {mode === "merge" ? t("selectMerge") : t("selectSplit")}
          </p>
        </div>

        {files.length === 0 && (
          <div className="mt-4">
            <SampleButton onLoad={handleLoadSample} layout="block" />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="surface-card rounded-lg p-lg">
              <div className="caption-upper text-muted-soft mb-4">
                {t("files")} ({files.length}{files.length > 0 ? ` · ${files.reduce((s, f) => s + f.pageCount, 0)} ${t("pages")}` : ""})
              </div>
              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragEnd={() => {
                      if (dragIdx !== null && dragIdx !== idx) moveFile(dragIdx, idx);
                      setDragIdx(null);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-3 p-3 bg-canvas rounded-md border border-hairline cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-4 h-4 text-muted-soft" />
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-medium text-ink truncate">{f.name}</div>
                      <div className="text-xs font-mono text-muted">{f.pageCount} {t("pages")} · PDF v{f.version}</div>
                    </div>
                    <button
                      onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                      className="p-1.5 text-muted hover:text-error transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {mode === "split" && (
              <div className="surface-card rounded-lg p-lg">
                <label className="caption-upper text-muted-soft block mb-3">
                  {t("pageRangeLabel")}
                </label>
                <input
                  type="text"
                  value={splitRanges}
                  onChange={(e) => { setSplitRanges(e.target.value); setSplitError(null); }}
                  placeholder={t("pageRangePlaceholder")}
                  className={`w-full px-4 py-2.5 bg-canvas border rounded-md text-ink font-mono focus:outline-none ${
                    splitError ? "border-error focus:border-error" : "border-hairline focus:border-primary"
                  }`}
                />
                {/* Error Display */}
                {splitError && (
                  <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-md">
                    <p className="text-body-sm text-error font-medium">{splitError}</p>
                  </div>
                )}
                <p className="mt-2 text-body-sm text-muted">
                  {t("totalPages")}: {files[0]?.pageCount || 0}
                </p>
              </div>
            )}

            <button
              onClick={mode === "merge" ? handleMerge : handleSplit}
              disabled={isProcessing || (mode === "merge" ? files.length < 2 : files.length !== 1)}
              className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mode === "merge" ? <Merge className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
              {isProcessing ? t("processing") : `${mode === "merge" ? t("merge") : t("split")} PDF`}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 surface-card rounded-xl p-xl">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-success" />
              <h4 className="text-title-md font-sans text-ink">{t("success")}</h4>
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("download")}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <AdBanner slot="pdf-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
          </div>
        )}

        {/* Share strip */}
        <div className="mt-8">
          <ShareButtons
            title={{
              en: "Merged & split PDFs entirely in my browser — no upload, no server. All-in-One Toolbox.",
              zh: "在浏览器里直接合并 / 拆分 PDF —— 零上传、零服务器。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Saved you a trip to Acrobat?",
              zh: "省下了一次 Acrobat 的钱？",
            }}
            hashtags={["PDFTools", "AllInOneToolbox", "BrowserPDF"]}
          />
        </div>

        {/* FAQ */}
        <section className="mt-section pt-xl border-t border-hairline">
          <h2 className="text-display-md font-serif text-ink mb-8">{t("faqTitle")}</h2>
          <div className="space-y-4">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
              { q: t("faq5Q"), a: t("faq5A") },
            ].map((item, idx) => (
              <details key={idx} className="group surface-card rounded-lg p-lg">
                <summary className="cursor-pointer text-title-sm font-sans font-medium text-ink hover:text-primary transition-colors">{item.q}</summary>
                <p className="mt-3 text-body-md text-body leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolPageFooter slug="pdf-merge-split" />
      </div>
    </div>
  );
}