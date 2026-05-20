"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileText, AlertCircle, CheckCircle, Clock, Server } from "lucide-react";
import PseudoProcessor from "@/components/PseudoProcessor";
import AdBanner from "@/components/AdBanner";

interface ConversionResult {
  fileName: string;
  processingTime: string;
  originalSize: number;
  pdfSize: number;
  blob: Blob;
}

type ConversionState = "idle" | "uploading" | "processing" | "success" | "error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WordToPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<ConversionState>("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadingTexts = [
    "[GOTENBERG]: Initializing LibreOffice engine...",
    "[UPLOAD]: Streaming document matrix...",
    "[CONVERT]: DOCX → PDF pipeline active...",
    "[RENDER]: Finalizing PDF stream...",
  ];

  // Check server status
  const checkServerStatus = useCallback(async () => {
    setIsCheckingServer(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health/gotenberg`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        setServerStatus("online");
      } else {
        setServerStatus("offline");
      }
    } catch {
      setServerStatus("offline");
    }
    setIsCheckingServer(false);
  }, []);

  // Check server on mount
  useState(() => {
    checkServerStatus();
  });

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".docx")) {
      setError("Please select a valid Word document (.docx)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds 5MB limit. Current size: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Generate preview (if possible)
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setState("uploading");
    setError(null);

    // Create abort controller for timeout handling
    abortControllerRef.current = new AbortController();

    // Simulate PseudoProcessor effect
    setState("processing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Set up timeout (5 seconds as per backend)
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, 5500); // 5.5 seconds to account for network latency

      const response = await fetch(`${API_BASE_URL}/api/v1/convert/word-to-pdf`, {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 413) {
        throw new Error("File size exceeds 5MB limit");
      }

      if (response.status === 429) {
        const data = await response.json();
        throw new Error(`Rate limit exceeded. Please wait ${data.retry_after_seconds || 60} seconds.`);
      }

      if (response.status === 504) {
        throw new Error("Conversion timeout (>5s). The server is busy. Please try again.");
      }

      if (response.status === 503) {
        throw new Error("Gotenberg service is unavailable. Please check server status.");
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || `Server error: ${response.status}`);
      }

      // Get processing time from header
      const processingTime = response.headers.get("X-Processing-Time") || "0";

      // Get PDF blob
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
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timeout. The server took too long to respond.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
    setPreview(null);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  const handleProcessComplete = useCallback(() => {
    // PseudoProcessor animation complete, proceed with actual conversion
    handleConvert();
  }, [handleConvert]);

  return (
    <div className="min-h-screen">
      <PseudoProcessor
        isProcessing={state === "processing"}
        onComplete={handleProcessComplete}
        loadingTexts={loadingTexts}
      />

      {/* Top Ad Banner */}
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <AdBanner slot="wordtopdf-tool-top" format="auto" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            <span className="gradient-cyber">WORD → PDF</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Server-Side Ultra Processing · Powered by Gotenberg · 5s Hard Timeout
          </p>
        </div>

        {/* Server Status */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={checkServerStatus}
            disabled={isCheckingServer}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-[var(--border-default)] rounded hover:border-[var(--neon-green)] transition-colors"
          >
            <Server className="w-3 h-3" />
            {isCheckingServer ? "Checking..." : "Check Server"}
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono border rounded ${
            serverStatus === "online" ? "border-[var(--neon-green)] text-[var(--neon-green)]" :
            serverStatus === "offline" ? "border-[var(--error)] text-[var(--error)]" :
            "border-[var(--border-default)] text-[var(--text-muted)]"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              serverStatus === "online" ? "bg-[var(--neon-green)] pulse-green" :
              serverStatus === "offline" ? "bg-[var(--error)]" :
              "bg-[var(--text-muted)]"
            }`} />
            {serverStatus === "online" ? "Gotenberg Online" :
             serverStatus === "offline" ? "Gotenberg Offline" :
             "Status Unknown"}
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 bg-[var(--bg-card)]/30 ${
            file ? "border-[var(--neon-green)]" : "border-[var(--border-default)] hover:border-[var(--neon-blue)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--neon-blue)]" />
          <p className="text-[var(--text-primary)] font-medium">
            {file ? file.name : "Drop Word document here or click to upload"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Supports .docx (Max 5MB) · Server-side processing
          </p>
        </div>

        {/* File Info */}
        {file && (
          <div className="mt-4 p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[var(--neon-green)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Convert Button */}
        {file && state === "idle" && (
          <button
            onClick={() => setState("processing")}
            disabled={state === "uploading" || state === "processing"}
            className="mt-6 w-full py-3 bg-[var(--neon-green)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-green)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Convert to PDF
          </button>
        )}

        {/* Progress Indicator (Simulated) */}
        {(state === "uploading" || state === "processing") && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--neon-green)]/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 border-2 border-[var(--neon-green)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-mono text-[var(--neon-green)]">
                  {state === "uploading" ? "Uploading to server..." : "Converting with Gotenberg..."}
                </span>
              </div>
              <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] animate-pulse" style={{ width: "100%" }} />
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)] font-mono">
                Timeout: 5s · Max concurrent: 2
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-[var(--bg-card)] border border-[var(--error)]/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--error)]">Conversion Failed</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 px-4 py-1.5 text-xs font-mono border border-[var(--border-default)] rounded hover:border-[var(--neon-green)] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Success Message */}
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--neon-green)]/30 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-[var(--neon-green)]" />
                <span className="text-sm font-mono text-[var(--neon-green)] uppercase">
                  Conversion Complete
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-[var(--bg-elevated)] rounded">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Original</div>
                  <div className="text-sm font-mono text-[var(--text-primary)]">{formatBytes(result.originalSize)}</div>
                </div>
                <div className="text-center p-3 bg-[var(--bg-elevated)] rounded">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">PDF Size</div>
                  <div className="text-sm font-mono text-[var(--neon-green)]">{formatBytes(result.pdfSize)}</div>
                </div>
                <div className="text-center p-3 bg-[var(--bg-elevated)] rounded">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Time</div>
                  <div className="text-sm font-mono text-[var(--neon-blue)]">{result.processingTime}</div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-[var(--neon-green)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-green)]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            {/* Bottom Ad */}
            <div className="py-4">
              <AdBanner slot="wordtopdf-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
            </div>

            {/* Convert Another */}
            <button
              onClick={handleReset}
              className="w-full py-2 text-sm font-mono text-[var(--text-secondary)] border border-[var(--border-default)] rounded-lg hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-colors"
            >
              Convert Another Document
            </button>
          </div>
        )}

        {/* SEO FAQ Section */}
        <section className="mt-16 pt-8 border-t border-[var(--border-default)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Frequently Asked Questions about Word to PDF Conversion
          </h2>
          <div className="space-y-6 text-sm text-[var(--text-secondary)]">
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How does server-side Word to PDF conversion work?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our conversion service uses Gotenberg, a powerful document conversion service powered by
                LibreOffice. When you upload a Word document, it is streamed directly to our server in
                memory, processed by LibreOffice to convert it to PDF format, and then streamed back to
                you. This ensures high-fidelity conversion that preserves formatting, fonts, images, and
                layouts from your original document.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What happens if the conversion times out?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our server implements a strict 5-second timeout for all conversion operations. This prevents
                long-running conversions from blocking the server and ensures fair access for all users.
                If your document takes longer than 5 seconds to convert, you will receive a 504 Gateway
                Timeout error. In this case, please try again with a smaller document or fewer complex
                elements like embedded images and custom fonts.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What Word document formats are supported?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                We support modern .docx files (Office Open XML format) which are the standard format since
                Microsoft Office 2007. Legacy .doc files are also partially supported. For best results,
                we recommend using .docx format with standard fonts installed on the system. Documents
                with macros (.docm) will have macros stripped during conversion as PDF does not support them.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Why is there a 5MB file size limit?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                The 5MB limit ensures that conversions complete quickly (within our 5-second timeout) and
                prevents any single user from monopolizing server resources. Large documents require more
                processing time and memory. If you need to convert larger documents, consider splitting
                them into smaller parts first, or consider using desktop software like Microsoft Word
                which can handle larger files offline.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Is my document secure during conversion?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                We implement a zero-footprint policy for document processing. Your files are processed
                entirely in server memory and never written to disk. Once the conversion is complete,
                the in-memory buffers are immediately freed. We also implement rate limiting (5 requests
                per minute per IP) to prevent abuse. However, for highly sensitive documents, we recommend
                using client-side tools that process entirely within your browser without server interaction.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How does rate limiting work?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our server uses a sliding window algorithm to limit conversions to 5 requests per minute
                per IP address. This prevents any single client from overwhelming the server with requests.
                The rate limit is tracked in server memory and resets automatically. If you hit the
                limit, you will receive a 429 Too Many Requests response with a retry-after header
                indicating when you can try again.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What happens to complex formatting during conversion?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                LibreOffice provides excellent fidelity when converting Word documents to PDF. Most
                formatting elements are preserved including fonts, colors, styles, paragraph formatting,
                headers and footers, page numbers, tables, images, and more. Some complex features like
                certain animations, WordArt, and legacy font effects may not be fully preserved. If you
                notice formatting issues, try simplifying the document before conversion.
              </p>
            </details>
          </div>
        </section>
      </section>
    </div>
  );
}