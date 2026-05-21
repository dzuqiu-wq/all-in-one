"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Upload, Download, FileText, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import PseudoProcessor from "@/components/PseudoProcessor";
import AdBanner from "@/components/AdBanner";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

interface ConversionResult {
  fileName: string;
  processingTime: string;
  originalSize: number;
  pdfSize: number;
  blob: Blob;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WordToPDFPage() {
  const t = useTranslations("tools.wordPdf");
  const homeHref = useLocalizedHref("/");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingTexts = [
    t("loading1"),
    t("loading2"),
    t("loading3"),
    t("loading4"),
  ];

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validExt = selectedFile.name.match(/\.(docx|doc)$/i);
    if (!validExt) {
      setError(t("errorInvalid"));
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(t("errorSize"));
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setState("processing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/v1/convert/word-to-pdf`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(7000),
      });

      if (response.status === 413) throw new Error(t("error413"));
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(`${t("error429")} ${data.retry_after_seconds || 60}s`);
      }
      if (response.status === 504) throw new Error(t("error504"));
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || `${t("errorGeneric")}: ${response.status}`);
      }

      const processingTime = response.headers.get("X-Processing-Time") || "0";
      const pdfBlob = await response.blob();

      setResult({
        fileName: file.name.replace(/\.(docx|doc)$/i, ".pdf"),
        processingTime: `${(parseFloat(processingTime) * 1000).toFixed(0)}ms`,
        originalSize: file.size,
        pdfSize: pdfBlob.size,
        blob: pdfBlob,
      });

      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUnexpected"));
      setState("error");
    }
  }, [file, t]);

  const handleDownload = useCallback(() => {
    if (!result?.blob) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  const handleReset = useCallback(() => {
    setFile(null);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <PseudoProcessor
        isProcessing={false}
        onComplete={() => {}}
        loadingTexts={loadingTexts}
      />

      <div className="max-w-4xl mx-auto px-6 py-section">
        {/* Back Link */}
        <Link href={homeHref} className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink mb-8 no-underline">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4" style={{ fontSize: "clamp(36px, 5vw, 48px)" }}>
            {t("title")}
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Top Ad */}
        <div className="mb-8">
          <AdBanner slot="wordtopdf-top" format="auto" />
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`surface-card border-2 border-dashed rounded-xl p-xxl text-center cursor-pointer transition-all duration-300 ${
            file ? "border-primary bg-surface-cream-strong" : "border-hairline hover:border-primary hover:bg-surface-cream-strong"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <FileText className="w-12 h-12 mx-auto mb-4 text-primary" strokeWidth={1.5} />
          <h4 className="text-title-md font-sans text-ink mb-2">
            {file ? file.name : t("dropzone")}
          </h4>
          <p className="text-body-sm text-muted">
            {file ? formatBytes(file.size) : t("supported")}
          </p>
        </div>

        {/* Action Button */}
        {file && state === "idle" && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleConvert}
              className="flex-1 py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t("convert")}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors"
            >
              {t("reset")}
            </button>
          </div>
        )}

        {/* Processing State */}
        {state === "processing" && (
          <div className="mt-6 surface-card rounded-lg p-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-body-sm font-medium text-ink">{t("processing")}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-6 surface-card border border-error/30 rounded-lg p-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-sans font-medium text-ink mb-1">{t("errorTitle")}</h5>
                <p className="text-body-sm text-body">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-canvas border border-hairline text-body-sm rounded-md hover:bg-surface-card transition-colors"
                >
                  {t("tryAgain")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="surface-card rounded-xl p-xl">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-success" />
                <h4 className="text-title-md font-sans text-ink">{t("success")}</h4>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="caption-upper text-muted-soft mb-1">{t("original")}</div>
                  <div className="text-title-md font-sans text-ink">{formatBytes(result.originalSize)}</div>
                </div>
                <div>
                  <div className="caption-upper text-muted-soft mb-1">{t("pdfSize")}</div>
                  <div className="text-title-md font-sans text-ink">{formatBytes(result.pdfSize)}</div>
                </div>
                <div>
                  <div className="caption-upper text-muted-soft mb-1">{t("time")}</div>
                  <div className="text-title-md font-sans text-primary">{result.processingTime}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t("download")} {result.fileName}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors"
                >
                  {t("convertAnother")}
                </button>
              </div>
            </div>

            {/* Mid Ad */}
            <AdBanner slot="wordtopdf-mid" format="rectangle" className="mx-auto max-w-[336px]" />
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-section pt-xl border-t border-hairline">
          <h2 className="text-display-md font-serif text-ink mb-8">
            {t("faqTitle")}
          </h2>
          <div className="space-y-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
              { q: t("faq5Q"), a: t("faq5A") },
              { q: t("faq6Q"), a: t("faq6A") },
            ].map((item, idx) => (
              <details key={idx} className="group surface-card rounded-lg p-lg">
                <summary className="cursor-pointer text-title-sm font-sans font-medium text-ink hover:text-primary transition-colors">
                  {item.q}
                </summary>
                <p className="mt-3 text-body-md text-body leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
