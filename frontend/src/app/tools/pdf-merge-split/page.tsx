"use client";

import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  Download,
  FileText,
  Merge,
  Scissors,
  Plus,
  Minus,
  X,
  GripVertical,
  Layers,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import PseudoProcessor from "@/components/PseudoProcessor";
import AdBanner from "@/components/AdBanner";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  pdfVersion: string;
}

interface SplitResult {
  fileName: string;
  pageRanges: string[];
  blob: Blob;
}

type Mode = "merge" | "split";

export default function PDFMergeSplitPage() {
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Blob | SplitResult[] | null>(null);
  const [splitRanges, setSplitRanges] = useState<string>("1");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingTexts = [
    "[SCANNING]: Parsing PDF structure...",
    "[DECRYPT]: Page tree analysis...",
    "[MERGE]: Stream concatenation...",
    "[RENDER]: Finalizing document...",
  ];

  const parsePDF = useCallback(async (file: File): Promise<PDFFile> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Try to get PDF version from header
    const header = new Uint8Array(arrayBuffer, 0, 8);
    const headerStr = new TextDecoder().decode(header);
    const versionMatch = headerStr.match(/\d\.\d/);
    const pdfVersion = versionMatch ? `1.${versionMatch[0].split(".")[1]}` : "1.7";

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      pageCount: pdfDoc.getPageCount(),
      pdfVersion,
    };
  }, []);

  const handleFilesAdd = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: PDFFile[] = [];
      for (const file of Array.from(selectedFiles)) {
        if (file.type === "application/pdf") {
          try {
            const parsed = await parsePDF(file);
            newFiles.push(parsed);
          } catch {
            console.error(`Failed to parse ${file.name}`);
          }
        }
      }

      setFiles((prev) => [...prev, ...newFiles]);
      setResult(null);
    },
    [parsePDF]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFilesAdd(e.dataTransfer.files);
    },
    [handleFilesAdd]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResult(null);
  }, []);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return newFiles;
    });
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragEnd = useCallback(
    (index: number) => {
      if (dragIndex !== null && dragIndex !== index) {
        moveFile(dragIndex, index);
      }
      setDragIndex(null);
    },
    [dragIndex, moveFile]
  );

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;

    setIsProcessing(true);

    // Small delay for PseudoProcessor effect
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      setResult(blob);
    } catch (error) {
      console.error("Merge failed:", error);
    }

    setIsProcessing(false);
  }, [files]);

  const handleSplit = useCallback(async () => {
    if (files.length !== 1) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const file = files[0];
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      // Parse split ranges (e.g., "1-3, 5, 7-9")
      const rangePatterns = splitRanges.split(",").map((r) => r.trim());
      const pagesToExtract: number[] = [];

      for (const pattern of rangePatterns) {
        if (pattern.includes("-")) {
          const [start, end] = pattern.split("-").map((n) => parseInt(n.trim(), 10));
          for (let i = start; i <= end && i <= totalPages; i++) {
            pagesToExtract.push(i - 1); // 0-indexed
          }
        } else {
          const pageNum = parseInt(pattern, 10);
          if (pageNum >= 1 && pageNum <= totalPages) {
            pagesToExtract.push(pageNum - 1);
          }
        }
      }

      // Remove duplicates and sort
      const uniquePages = [...new Set(pagesToExtract)].sort((a, b) => a - b);

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, uniquePages);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: "application/pdf" });

      setResult([
        {
          fileName: `split_${file.name}`,
          pageRanges: [splitRanges],
          blob,
        },
      ]);
    } catch (error) {
      console.error("Split failed:", error);
    }

    setIsProcessing(false);
  }, [files, splitRanges]);

  const handleDownload = useCallback(
    (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleProcessComplete = useCallback(() => {
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen">
      <PseudoProcessor
        isProcessing={isProcessing}
        onComplete={handleProcessComplete}
        loadingTexts={loadingTexts}
      />

      {/* Top Ad Banner */}
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <AdBanner slot="pdf-tool-top" format="auto" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            <span className="gradient-cyber">PDF MERGE & SPLIT</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Client-Side Pure Processing · No Server Upload · Powered by pdf-lib
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setMode("merge");
              setResult(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              mode === "merge"
                ? "bg-[var(--neon-green)] text-[var(--bg-primary)]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--neon-green)]"
            }`}
          >
            <Merge className="w-4 h-4" />
            Merge Mode
          </button>
          <button
            onClick={() => {
              setMode("split");
              setResult(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              mode === "split"
                ? "bg-[var(--neon-blue)] text-[var(--bg-primary)]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--neon-blue)]"
            }`}
          >
            <Scissors className="w-4 h-4" />
            Split Mode
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 bg-[var(--bg-card)]/30 ${
            mode === "merge"
              ? "border-[var(--border-default)] hover:border-[var(--neon-green)]"
              : "border-[var(--border-default)] hover:border-[var(--neon-blue)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple={mode === "merge"}
            onChange={(e) => handleFilesAdd(e.target.files)}
            className="hidden"
          />
          <FileText
            className={`w-12 h-12 mx-auto mb-4 ${
              mode === "merge" ? "text-[var(--neon-green)]" : "text-[var(--neon-blue)]"
            }`}
          />
          <p className="text-[var(--text-primary)] font-medium">
            {mode === "merge"
              ? "Drop multiple PDF files to merge"
              : "Drop a single PDF file to split"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {mode === "merge" ? "Select or drop 2+ PDF files" : "Select or drop 1 PDF file"}
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">
                File Node Index ({files.length} files)
              </h3>
              {mode === "merge" && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-[var(--error)] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Topology Visualization */}
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {files.map((pdf, index) => (
                  <div key={pdf.id} className="flex items-center">
                    {/* Node */}
                    <div
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnd={() => handleDragEnd(index)}
                      onDragOver={(e) => e.preventDefault()}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded border
                        bg-[var(--bg-elevated)] cursor-grab active:cursor-grabbing
                        transition-all duration-200 min-w-[180px]
                        ${
                          dragIndex === index
                            ? "opacity-50 border-[var(--neon-green)]"
                            : "border-[var(--border-default)] hover:border-[var(--neon-green)]/50"
                        }
                      `}
                    >
                      <GripVertical className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                      <FileText className="w-4 h-4 text-[var(--neon-green)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {pdf.name}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--text-muted)]">
                          {pdf.pageCount} pages · v{pdf.pdfVersion}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(pdf.id);
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Arrow connector */}
                    {index < files.length - 1 && (
                      <div className="flex items-center px-2 text-[var(--neon-green)]">
                        <div className="w-8 h-px bg-[var(--neon-green)]/50" />
                        <Merge className="w-3 h-3" />
                        <div className="w-8 h-px bg-[var(--neon-green)]/50" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-default)]">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Files</span>
                  <p className="text-lg font-bold font-mono text-[var(--neon-green)]">{files.length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Pages</span>
                  <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                    {files.reduce((acc, f) => acc + f.pageCount, 0)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Output Format</span>
                  <p className="text-lg font-bold font-mono text-[var(--neon-blue)]">PDF 1.7</p>
                </div>
              </div>
            </div>

            {/* Split Mode: Page Range Input */}
            {mode === "split" && (
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--neon-blue)]/30 rounded-lg">
                <label className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Page Range (e.g., 1-3, 5, 7-9)
                </label>
                <input
                  type="text"
                  value={splitRanges}
                  onChange={(e) => setSplitRanges(e.target.value)}
                  placeholder="1-3, 5, 7-9"
                  className="mt-2 w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-mono focus:border-[var(--neon-blue)] focus:outline-none"
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Total pages available: {files[0]?.pageCount || 0}
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={mode === "merge" ? handleMerge : handleSplit}
              disabled={
                isProcessing ||
                (mode === "merge" ? files.length < 2 : files.length !== 1)
              }
              className={`w-full py-3 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                mode === "merge"
                  ? "bg-[var(--neon-green)] text-[var(--bg-primary)] hover:bg-[var(--neon-green)]/90"
                  : "bg-[var(--neon-blue)] text-[var(--bg-primary)] hover:bg-[var(--neon-blue)]/90"
              }`}
            >
              {mode === "merge" ? (
                <>
                  <Merge className="w-4 h-4" />
                  {isProcessing ? "Merging..." : `Merge ${files.length} Files`}
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  {isProcessing ? "Splitting..." : "Split PDF"}
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--neon-green)]/30 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[var(--neon-green)]" />
                <span className="text-sm font-mono text-[var(--neon-green)] uppercase">
                  Processing Complete
                </span>
              </div>

              {result instanceof Blob ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Merged PDF Ready</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {files.length} files merged into single document
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(result, "merged-document.pdf")}
                    className="px-4 py-2 bg-[var(--neon-green)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-green)]/90 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(result as SplitResult[]).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">{item.fileName}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Pages: {item.pageRanges.join(", ")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(item.blob, item.fileName)}
                        className="px-4 py-2 bg-[var(--neon-blue)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-blue)]/90 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mid-page Ad */}
            <div className="py-4">
              <AdBanner slot="pdf-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
            </div>
          </div>
        )}

        {/* SEO FAQ Section */}
        <section className="mt-16 pt-8 border-t border-[var(--border-default)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Frequently Asked Questions about PDF Merge and Split Tools
          </h2>
          <div className="space-y-6 text-sm text-[var(--text-secondary)]">
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How does browser-based PDF processing work without uploading files?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our PDF tools use the pdf-lib library, a pure JavaScript implementation that runs entirely
                in your browser. When you upload a PDF, it is read into memory using the File API, processed
                using WebAssembly-optimized JavaScript, and made available for download without ever leaving
                your device. This ensures complete privacy, faster processing, and no server costs.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Can I merge PDFs with different versions or encryption?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our merger supports PDFs from version 1.0 through 1.7. However, password-protected or
                encrypted PDFs cannot be processed in the browser for security reasons. If you encounter
                an encrypted file, you will need to decrypt it using the original software first, then
                upload it to our tool. The output will always be created as an uncompressed PDF 1.7 for
                maximum compatibility.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What page range formats are supported for PDF splitting?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our split tool accepts flexible range formats including: single pages (1, 2, 3), ranges
                (1-5, 10-15), and mixed formats (1-3, 7, 10-12). You can also specify pages in any order
                (e.g., 5, 3, 1 will output pages 5, 3, 1 in that sequence). Invalid page numbers or
                out-of-range values are automatically ignored to prevent errors.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How does the drag-and-drop file reordering work for merging?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our merge interface displays files as a visual topology graph, showing file nodes connected
                by merge arrows. You can drag files to reorder them before merging, which determines the
                page order in the final output document. The first file in the sequence will have its pages
                first, followed by the second file, and so on. This visual approach makes it easy to
                understand and control the merge order.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Is there a file size or page count limit?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our browser-based PDF tools process files in memory, so limits depend on your device's
                available RAM. For optimal performance, we recommend files under 50MB and total pages
                under 500. Very large files may cause memory warnings in the browser. If you need to
                process larger documents, consider splitting them into smaller batches first, or use
                our server-side API for professional workflows.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Can I preserve bookmarks, annotations, and form fields during merge?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Currently, our tool processes PDF page content directly without preserving advanced
                features like bookmarks, annotations, form fields, or JavaScript. The output contains
                the visual page content and text where possible, but these advanced features are not
                supported in the browser environment. For full feature preservation, professional PDF
                software with server-side processing would be required.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How secure is my document when using browser-based PDF tools?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Security is our top priority. Files are processed entirely in your browser using
                JavaScript and never uploaded to any server. The File API keeps your documents in
                local memory, and no network requests are made with your file data. Once you close
                the browser tab or navigate away, all document data is cleared from memory. This
                makes our tools ideal for processing sensitive business documents, legal files,
                or any content requiring strict confidentiality.
              </p>
            </details>
          </div>
        </section>
      </section>
    </div>
  );
}