"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, FileText, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import PseudoProcessor from "@/components/PseudoProcessor";
import AdBanner from "@/components/AdBanner";

interface ConversionResult {
  fileName: string;
  processingTime: string;
  originalSize: number;
  pdfSize: number;
  blob: Blob;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WordToPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingTexts = [
    "Initializing LibreOffice engine...",
    "Streaming document matrix...",
    "Converting DOCX → PDF...",
    "Finalizing PDF stream...",
  ];

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validExt = selectedFile.name.match(/\.(docx|doc)$/i);
    if (!validExt) {
      setError("Please select a valid Word document (.docx or .doc)");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(`File size exceeds 5MB limit. Current: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
  }, []);

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

      if (response.status === 413) throw new Error("File size exceeds 5MB limit");
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(`Rate limit exceeded. Try again in ${data.retry_after_seconds || 60}s`);
      }
      if (response.status === 504) throw new Error("Conversion timeout. Server is busy.");
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || `Server error: ${response.status}`);
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
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setState("error");
    }
  }, [file]);

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
        <a href="/" className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink mb-8 no-underline">
          <ArrowLeft className="w-4 h-4" />
          Back to all tools
        </a>

        {/* Hero */}
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">Document Conversion</div>
          <h1 className="text-display-lg font-serif text-ink mb-4" style={{ fontSize: "clamp(36px, 5vw, 48px)" }}>
            Word → PDF
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            Convert Word documents to PDF with high-fidelity LibreOffice processing.
            Memory-only pipeline, no disk I/O, 5-second hard timeout.
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
            {file ? file.name : "Drop your Word document here"}
          </h4>
          <p className="text-body-sm text-muted">
            {file ? formatBytes(file.size) : "Maximum file size: 5 MB · Supports .docx and .doc"}
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
              Convert to PDF
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* Processing State */}
        {state === "processing" && (
          <div className="mt-6 surface-card rounded-lg p-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-body-sm font-medium text-ink">Converting via Gotenberg...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-6 surface-card border border-error/30 rounded-lg p-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-sans font-medium text-ink mb-1">Conversion Failed</h5>
                <p className="text-body-sm text-body">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-canvas border border-hairline text-body-sm rounded-md hover:bg-surface-card transition-colors"
                >
                  Try again
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
                <h4 className="text-title-md font-sans text-ink">Conversion complete</h4>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="caption-upper text-muted-soft mb-1">Original</div>
                  <div className="text-title-md font-sans text-ink">{formatBytes(result.originalSize)}</div>
                </div>
                <div>
                  <div className="caption-upper text-muted-soft mb-1">PDF Size</div>
                  <div className="text-title-md font-sans text-ink">{formatBytes(result.pdfSize)}</div>
                </div>
                <div>
                  <div className="caption-upper text-muted-soft mb-1">Time</div>
                  <div className="text-title-md font-sans text-primary">{result.processingTime}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download {result.fileName}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors"
                >
                  Convert another
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
            Common questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How does the conversion work?",
                a: "Our server uses Gotenberg, a powerful document conversion service powered by LibreOffice. When you upload a Word document, it streams directly to memory, gets processed by LibreOffice, and streams back as PDF — your file never touches disk."
              },
              {
                q: "What is the 5-second timeout?",
                a: "Our server enforces a strict 5-second timeout for all conversions. This prevents long-running tasks from blocking other users and ensures predictable performance. If you hit the timeout, try a smaller document or simpler formatting."
              },
              {
                q: "Why is the file size limit 5MB?",
                a: "Combined with the 5-second timeout, the 5MB limit ensures fast conversions and fair resource sharing. For larger documents, consider splitting them first or using desktop software."
              },
              {
                q: "Is my document secure during conversion?",
                a: "Yes. We implement a zero-footprint policy: files are processed entirely in server memory and never written to disk. Once converted, all memory buffers are immediately freed."
              },
              {
                q: "What formats are supported?",
                a: "We support .docx (Office Open XML, the standard since 2007) and .doc (legacy format). For best results, use .docx with standard fonts. Macros are stripped during conversion as PDF does not support them."
              },
              {
                q: "How does rate limiting work?",
                a: "Each IP address is limited to 5 conversions per minute using a sliding window algorithm. If you hit the limit, you will receive a 429 response with a retry-after header indicating when you can try again."
              },
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