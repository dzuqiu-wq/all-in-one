"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Download, Image, Zap, CheckCircle, BarChart3 } from "lucide-react";
import PseudoProcessor from "@/components/PseudoProcessor";
import AdBanner from "@/components/AdBanner";

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: string;
  mimeType: string;
  compressionRatio: number;
  histogram: { r: number; g: number; b: number };
}

export default function ImageOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [outputFormat, setOutputFormat] = useState<"webp" | "jpeg" | "png">("webp");
  const [quality, setQuality] = useState(80);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingTexts = [
    "[SCANNING]: Analyzing image matrix...",
    "[COMPRESS]: Quantum reduction engine...",
    "[OPTIM]: WebP transcoding pipeline...",
    "[RENDER]: Viewport recalibration...",
  ];

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setConvertedBlob(null);

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

  const extractHistogram = useCallback((imgElement: HTMLImageElement): { r: number; g: number; b: number } => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return { r: 0, g: 0, b: 0 };

    // Sample at lower resolution for performance
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(imgElement, 0, 0, 100, 100);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    let rTotal = 0, gTotal = 0, bTotal = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      rTotal += data[i];
      gTotal += data[i + 1];
      bTotal += data[i + 2];
      pixelCount++;
    }

    return {
      r: Math.round(rTotal / pixelCount),
      g: Math.round(gTotal / pixelCount),
      b: Math.round(bTotal / pixelCount),
    };
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);

    // Create image element to get dimensions
    const img = new Image();
    img.onload = async () => {
      const histogram = extractHistogram(img);

      // Compress image
      const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        initialQuality: quality / 100,
      };

      const compressedFile = await imageCompression(file, compressionOptions);

      // Get original dimensions
      const aspectRatio = `${img.width}:${img.height}`;
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(img.width, img.height);
      const simplifiedRatio = `${img.width / divisor}:${img.height / divisor}`;

      // Convert to desired format
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const mimeType = outputFormat === "webp" ? "image/webp" : outputFormat === "jpeg" ? "image/jpeg" : "image/png";
        const qualityParam = outputFormat !== "png" ? quality / 100 : undefined;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), mimeType, qualityParam);
        });

        setConvertedBlob(blob);
      }

      setResult({
        originalSize: file.size,
        compressedSize: compressedFile.size,
        originalWidth: img.width,
        originalHeight: img.height,
        aspectRatio: simplifiedRatio,
        mimeType: file.type,
        compressionRatio: ((file.size - compressedFile.size) / file.size) * 100,
        histogram,
      });

      setIsProcessing(false);
    };
    img.src = preview!;
  }, [file, preview, quality, outputFormat, extractHistogram]);

  const handleDownload = useCallback(() => {
    if (!convertedBlob) return;

    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-image.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [convertedBlob, outputFormat]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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
        <AdBanner slot="image-tool-top" format="auto" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            <span className="gradient-cyber">IMAGE OPTIMIZER</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Client-Side Pure Processing · Zero Server Upload · WebP Conversion
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--neon-green)] rounded-lg p-8 text-center cursor-pointer transition-all duration-300 bg-[var(--bg-card)]/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--neon-green)]" />
          <p className="text-[var(--text-primary)] font-medium">
            Drop your image here or click to upload
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Supports JPG, PNG, GIF, WebP (Max 10MB)
          </p>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mt-6 space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-[var(--border-default)]">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-96 object-contain bg-[var(--bg-secondary)]"
              />
            </div>

            {/* Processing Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)]">
              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Output Format
                </label>
                <div className="flex gap-2 mt-2">
                  {(["webp", "jpeg", "png"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
                        outputFormat === fmt
                          ? "bg-[var(--neon-green)] text-[var(--bg-primary)]"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--neon-green)]"
                      }`}
                    >
                      .{fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full mt-2 accent-[var(--neon-green)]"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full px-4 py-2.5 bg-[var(--neon-green)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-green)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Optimize Image"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                  Original Size
                </div>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
                  {formatBytes(result.originalSize)}
                </div>
              </div>
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                  Compressed Size
                </div>
                <div className="text-xl font-bold font-mono text-[var(--neon-green)] mt-1">
                  {formatBytes(result.compressedSize)}
                </div>
              </div>
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                  Space Saved
                </div>
                <div className="text-xl font-bold font-mono text-[var(--neon-green)] mt-1">
                  {result.compressionRatio.toFixed(1)}%
                </div>
              </div>
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                  Dimensions
                </div>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
                  {result.originalWidth}×{result.originalHeight}
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aspect Ratio & Histogram */}
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[var(--neon-blue)]" />
                  <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Technical Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[var(--text-muted)]">Aspect Ratio:</span>
                    <span className="ml-2 text-[var(--text-primary)]">{result.aspectRatio}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">MIME Type:</span>
                    <span className="ml-2 text-[var(--text-primary)]">{result.mimeType}</span>
                  </div>
                </div>

                {/* Color Histogram */}
                <div className="mt-4">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Color Channel Density</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-mono text-[var(--error)]">R</span>
                      <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--error)]"
                          style={{ width: `${(result.histogram.r / 255) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-[10px] font-mono text-[var(--error)]">{result.histogram.r}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-mono text-[var(--neon-green)]">G</span>
                      <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--neon-green)]"
                          style={{ width: `${(result.histogram.g / 255) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-[10px] font-mono text-[var(--neon-green)]">{result.histogram.g}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-mono text-[var(--neon-blue)]">B</span>
                      <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--neon-blue)]"
                          style={{ width: `${(result.histogram.b / 255) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-[10px] font-mono text-[var(--neon-blue)]">{result.histogram.b}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-[var(--neon-green)]" />
                    <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Ready for Download</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Your optimized image is ready. File has been converted to{" "}
                    <span className="text-[var(--neon-green)] font-mono">.{outputFormat.toUpperCase()}</span> format
                    with <span className="text-[var(--neon-green)] font-mono">{quality}%</span> quality setting.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-4 w-full px-4 py-3 bg-[var(--neon-green)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-green)]/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Optimized Image
                </button>
              </div>
            </div>

            {/* Mid-page Ad */}
            <div className="py-4">
              <AdBanner slot="image-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
            </div>
          </div>
        )}

        {/* SEO FAQ Section */}
        <section className="mt-16 pt-8 border-t border-[var(--border-default)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Frequently Asked Questions about Image Optimization
          </h2>
          <div className="space-y-6 text-sm text-[var(--text-secondary)]">
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How does browser-based image compression work without uploading files?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our image optimizer uses the Web Compression API and HTML5 Canvas directly in your browser.
                When you upload an image, it is processed entirely within your device using JavaScript and
                browser-image-compression library. Your files never leave your computer, ensuring complete
                privacy and faster processing since there is no upload/download latency.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What is WebP format and why should I convert images to it?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                WebP is a modern image format developed by Google that provides superior lossless and lossy
                compression for images on the web. WebP files are typically 25-35% smaller than JPEG files
                of similar quality, and 25% smaller than PNG files. This results in faster page load times,
                reduced bandwidth costs, and improved user experience on websites and applications.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What quality setting should I use for optimal results?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                The ideal quality setting depends on your use case. For web images where file size is critical,
                60-75% quality often provides the best balance between visual appearance and compression.
                For print or detailed graphics requiring high fidelity, 85-95% is recommended. Our tool
                provides real-time preview and compression statistics so you can find the optimal setting.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Can I compress multiple images at once or batch process?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Currently, our tool processes one image at a time to ensure maximum quality control and
                accurate compression statistics. For batch processing multiple images, you can reload the
                page and repeat the process, or consider using our API integration for automated workflows.
                We are working on adding batch processing capabilities in future updates.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What image formats are supported for compression and conversion?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our optimizer supports input in JPEG, PNG, GIF, WebP, and most common image formats.
                Output can be generated in WebP (recommended), JPEG, or PNG format. WebP offers the best
                compression, JPEG is universally compatible, and PNG preserves transparency and supports
                lossless compression for graphics that require perfect quality.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How is the compression ratio calculated and what affects it?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Compression ratio is calculated as: ((original size - compressed size) / original size) × 100.
                Factors affecting compression include: image complexity (simple images compress better), original
                format (PNG typically sees higher compression when converted), and quality settings. Photographs
                with many colors typically show 40-70% reduction, while graphics with large uniform areas may
                achieve 70-90% reduction in file size.
              </p>
            </details>
          </div>
        </section>
      </section>

      {/* Hidden Canvas for Histogram */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}