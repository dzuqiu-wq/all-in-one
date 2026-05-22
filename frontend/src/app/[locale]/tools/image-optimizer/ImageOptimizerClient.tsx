"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";
import { Download, Image as ImageIcon, Zap } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import SampleButton from "@/components/SampleButton";
import { buildSampleImageFile } from "@/lib/sampleData";

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  aspectRatio: string;
  histogram: { r: number; g: number; b: number };
}

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
            name: "Image Optimizer & Compressor",
            operatingSystem: "All",
            applicationCategory: "DesignApplication",
            browserRequirements: "Requires HTML5 Canvas API and File API support",
            url: "https://333654.xyz/tools/image-optimizer",
            description: "Compress images and convert to WebP format. Smart compression reduces file size by up to 80% while preserving quality. Pure browser processing with Web Workers.",
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
                name: "Will EXIF data be preserved?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For privacy protection, optimized images automatically remove all EXIF metadata including camera information, GPS location data, creation timestamps, and device information.",
                },
              },
              {
                "@type": "Question",
                name: "What output formats are supported?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can output to WebP (recommended for best compression), JPEG, or PNG formats. WebP typically provides 25-35% better compression than JPEG at the same quality level.",
                },
              },
              {
                "@type": "Question",
                name: "How does quality setting affect images?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Higher quality values preserve more visual detail but result in larger files. Lower values create smaller files but may introduce visible compression artifacts. 80-85% is usually the best balance.",
                },
              },
              {
                "@type": "Question",
                name: "Can I use this on mobile devices?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, the image optimizer works on all modern mobile browsers including Chrome and Safari on iOS and Android devices. Performance depends on your device specs.",
                },
              },
              {
                "@type": "Question",
                name: "How do I choose the best quality value?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For most uses, 80-85% is the optimal balance. Above 90%, visual differences are hard to distinguish but files become larger; below 70%, visible noise appears.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}

function StructuredDataZH() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "图片优化器与压缩器",
            operatingSystem: "All",
            applicationCategory: "DesignApplication",
            browserRequirements: "Requires HTML5 Canvas API and File API support",
            url: "https://333654.xyz/zh/tools/image-optimizer",
            description: "压缩图片并转换为 WebP 格式。智能压缩可在保持质量的同时将文件大小减少 80%。纯浏览器处理，无需上传，隐私安全。",
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
                name: "图片会保留 EXIF 数据吗？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "出于隐私保护，优化后的图片会自动移除所有 EXIF 元数据，包括相机信息、GPS 位置数据、创建时间戳和设备信息。当您在网上分享照片时，这确保您的个人元数据不会泄露。",
                },
              },
              {
                "@type": "Question",
                name: "支持哪些输出格式？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "您可以输出为 WebP（推荐以获得最佳压缩效果）、JPEG 或 PNG 格式。WebP 通常在相同质量水平下提供比 JPEG 好 25-35% 的压缩效果。",
                },
              },
              {
                "@type": "Question",
                name: "质量设置如何影响图片？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "较高的质量值保留更多视觉细节，但生成更大的文件。较低的值创建更小的文件，但可能会引入可见的压缩伪影。80-85% 通常是最佳平衡点。",
                },
              },
              {
                "@type": "Question",
                name: "可以在移动设备上使用吗？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "是的，图片优化器可在所有现代移动浏览器上运行，包括 iOS 上的 Chrome 和 Safari 以及 Android 设备。性能取决于您的设备配置。",
                },
              },
              {
                "@type": "Question",
                name: "如何选择最佳的质量值？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "对于大多数用途，80-85% 是最佳平衡点。超过 90% 质量时，肉眼难以分辨差异但文件会明显变大；低于 70% 会出现明显噪点。",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}

export default function ImageOptimizerPage() {
  const t = useTranslations("tools.imageOptimizer");
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

  const handleLoadSample = useCallback(async () => {
    const sample = await buildSampleImageFile();
    handleFileSelect(sample);
  }, [handleFileSelect]);

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
      {/* SEO Structured Data */}
      <StructuredDataEN />
      
      <div className="max-w-4xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="image-optimizer" />

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

        {!preview && (
          <div className="mt-4">
            <SampleButton onLoad={handleLoadSample} layout="block" />
          </div>
        )}

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
                { label: t("optimized"), value: formatBytes(result.compressedSize) },
                { label: t("saved"), value: `${compressionRatio}%`, highlight: true },
                { label: "Dimensions", value: `${result.width}×${result.height}` },
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
              <div className="caption-upper text-muted-soft mb-4">Color Density</div>
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
              <p className="mt-3 text-body-sm text-muted">Aspect Ratio: {result.aspectRatio}</p>
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

        <ToolPageFooter slug="image-optimizer" />
      </div>
    </div>
  );
}