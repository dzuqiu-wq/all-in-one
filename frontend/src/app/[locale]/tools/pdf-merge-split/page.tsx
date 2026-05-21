"use client";

import { useState, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { Download, FileText, Merge, Scissors, X, GripVertical, ArrowLeft, CheckCircle } from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  version: string;
}

type Mode = "merge" | "split";

export default function PDFMergeSplitPage() {
  const t = useTranslations("tools.pdfMerge");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [splitRanges, setSplitRanges] = useState("1");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsePDF = async (file: File): Promise<PDFFile> => {
    const buf = await file.arrayBuffer();
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const header = new TextDecoder().decode(new Uint8Array(buf, 0, 8));
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
      setResult(new Blob([bytes], { type: "application/pdf" }));
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  const handleSplit = async () => {
    if (files.length !== 1) return;
    setIsProcessing(true);
    try {
      const f = files[0];
      const buf = await f.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = doc.getPageCount();
      const pages: number[] = [];
      for (const p of splitRanges.split(",").map(s => s.trim())) {
        if (p.includes("-")) {
          const [s, e] = p.split("-").map(n => parseInt(n));
          for (let i = s; i <= Math.min(e, total); i++) pages.push(i - 1);
        } else {
          const n = parseInt(p);
          if (n >= 1 && n <= total) pages.push(n - 1);
        }
      }
      const unique = [...new Set(pages)].sort((a, b) => a - b);
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(doc, unique);
      copied.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save();
      setResult(new Blob([bytes], { type: "application/pdf" }));
    } catch (e) { console.error(e); }
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
      <div className="max-w-4xl mx-auto px-6 py-section">
        <a href={`/${locale}/`} className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink mb-8 no-underline">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </a>

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
                  onChange={(e) => setSplitRanges(e.target.value)}
                  placeholder={t("pageRangePlaceholder")}
                  className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-ink font-mono focus:border-primary focus:outline-none"
                />
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
      </div>
    </div>
  );
}
