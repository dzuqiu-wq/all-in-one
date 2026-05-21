"use client";

import { useState, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { Upload, Download, Image as ImageIcon, Zap, ArrowLeft } from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  aspectRatio: string;
  histogram: { r: number; g: number; b: number };
}

export default function ImageOptimizerPage() {
  const t = useTranslations("tools.imageOptimizer");
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [outputFormat, setOutputFormat] = useState<"webp" | "jpeg" | "png">("webp");
  const [quality, setQuality] = useState(80);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      alert(t("errorInvalid"));
      return;
    }
    setFile(f);
    setResult(null);
    setConvertedBlob(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, [t]);

  const extractHistogram = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return { r: 0, g: 0, b: 0 };
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    const data = ctx.getImageData(0, 0, 100, 100).data;
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
  };

  const handleProcess = useCallback(async () => {
    if (!file || !preview) return;
    setIsProcessing(true);
    const img = new Image();
    img.onload = async () => {
      const histogram = extractHistogram(img);
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        initialQuality: quality / 100,
      });

      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(img.width, img.height);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const mime = outputFormat === "webp" ? "image/webp" : outputFormat === "jpeg" ? "image/jpeg" : "image/png";
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mime, quality / 100));
        setConvertedBlob(blob);
      }

      setResult({
        originalSize: file.size,
        compressedSize: compressed.size,
        width: img.width,
        height: img.height,
        aspectRatio: `${img.width / divisor}:${img.height / divisor}`,
        histogram,
      });
      setIsProcessing(false);
    };
    img.src = preview;
  }, [file, preview, quality, outputFormat]);

  const handleDownload = useCallback(() => {
    if (!convertedBlob) return;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [convertedBlob, outputFormat]);

  const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

  const compressionRatio = result ? ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1) : "0";

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
          <AdBanner slot="image-tool-top" format="auto" />
        </div>

        {/* Upload Zone */}
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="surface-card border-2 border-dashed border-hairline rounded-xl p-xxl text-center cursor-pointer transition-all hover:border-primary hover:bg-surface-cream-strong"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-primary" strokeWidth={1.5} />
          <h4 className="text-title-md font-sans text-ink mb-2">
            {file ? file.name : t("dropzone")}
          </h4>
          <p className="text-body-sm text-muted">{t("supportedFormats")}</p>
        </div>

        {/* Preview & Options */}
        {preview && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg overflow-hidden border border-hairline">
              <img src={preview} alt="Preview" className="w-full max-h-96 object-contain bg-surface-card" />
            </div>

            <div className="surface-card rounded-lg p-lg grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="caption-upper text-muted-soft block mb-3">{t("outputFormat")}</label>
                <div className="flex gap-2">
                  {(["webp", "jpeg", "png"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`px-3 py-1.5 text-body-sm font-medium rounded-md transition-colors ${
                        outputFormat === fmt
                          ? "bg-primary text-on-primary"
                          : "bg-canvas border border-hairline text-body hover:text-ink"
                      }`}
                    >
                      .{fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="caption-upper text-muted-soft block mb-3">{t("quality")}: {quality}%</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isProcessing ? t("processing") : t("optimize")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("original"), value: formatBytes(result.originalSize) },
                { label: t("compressed"), value: formatBytes(result.compressedSize) },
                { label: t("saved"), value: `${compressionRatio}%`, highlight: true },
                { label: t("dimensions"), value: `${result.width}×${result.height}` },
              ].map((stat) => (
                <div key={stat.label} className="surface-card rounded-lg p-md">
                  <div className="caption-upper text-muted-soft mb-1">{stat.label}</div>
                  <div className={`text-title-md font-sans ${stat.highlight ? "text-primary" : "text-ink"}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Histogram */}
            <div className="surface-card rounded-lg p-lg">
              <div className="caption-upper text-muted-soft mb-4">{t("colorDensity")}</div>
              <div className="space-y-3">
                {[
                  { label: "R", value: result.histogram.r, color: "#c64545" },
                  { label: "G", value: result.histogram.g, color: "#5db872" },
                  { label: "B", value: result.histogram.b, color: "#5db8a6" },
                ].map((ch) => (
                  <div key={ch.label} className="flex items-center gap-3">
                    <span className="w-6 text-body-sm font-mono font-medium" style={{ color: ch.color }}>{ch.label}</span>
                    <div className="flex-1 h-2 bg-canvas rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(ch.value / 255) * 100}%`, backgroundColor: ch.color }} />
                    </div>
                    <span className="w-10 text-body-sm font-mono text-right">{ch.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-body-sm text-muted">{t("aspectRatio")}: {result.aspectRatio}</p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("download")}
            </button>

            <AdBanner slot="image-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
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
