"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Image as ImageIcon, Loader } from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  initialPage?: number;
}

export default function FilePreviewModal({ isOpen, onClose, file, initialPage = 1 }: FilePreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isImage = file?.type.startsWith("image/");
  const isPdf = file?.type === "application/pdf";

  useEffect(() => {
    if (!file || !isPdf) return;
    
    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setTotalPages(pdf.numPages);
        
        const pages: string[] = [];
        const scale = 1.5;
        for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          pages.push(canvas.toDataURL("image/png"));
        }
        setPdfPages(pages);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPdf();
  }, [file, isPdf]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1);
      setZoom(1);
      setPdfPages([]);
      setTotalPages(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentPage > 1) setCurrentPage(p => p - 1);
      if (e.key === "ArrowRight" && currentPage < totalPages) setCurrentPage(p => p + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentPage, totalPages]);

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-6xl mx-4 my-8 bg-canvas rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-hairline">
          <div className="flex items-center gap-3">
            {isPdf ? <FileText className="w-5 h-5 text-primary" /> : <ImageIcon className="w-5 h-5 text-primary" />}
            <span className="text-title-sm font-medium text-ink">{file.name}</span>
            {isPdf && totalPages > 0 && (
              <span className="text-body-sm text-muted">{currentPage} / {totalPages}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-md transition-colors" title="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-body-sm text-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-md transition-colors" title="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </button>
            <a href={URL.createObjectURL(file)} download={file.name} className="p-2 text-muted hover:text-ink hover:bg-surface rounded-md transition-colors" title="Download">
              <Download className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-ink/5 p-4 flex items-center justify-center">
          {error ? (
            <p className="text-error">{error}</p>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <span className="text-body-sm text-muted">Loading...</span>
            </div>
          ) : isImage ? (
            <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                unoptimized
              />
            </div>
          ) : isPdf ? (
            <div className="flex flex-col items-center gap-4">
              {pdfPages.length > 0 && (
                <>
                  <div className="relative bg-white shadow-xl rounded-lg overflow-hidden" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
                    <img src={pdfPages[currentPage - 1]} alt={`Page ${currentPage}`} className="max-w-full" />
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-4 py-2">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-surface text-muted hover:text-ink hover:bg-primary/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-body-sm text-muted">{currentPage} / {totalPages}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-surface text-muted hover:text-ink hover:bg-primary/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
