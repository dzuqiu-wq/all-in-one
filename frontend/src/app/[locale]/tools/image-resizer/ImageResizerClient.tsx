"use client";
import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Crop, Download, Image as ImageIcon, RotateCcw, Wand2 } from "lucide-react";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import { resizeImage, type Dimensions } from "@/lib/tools/imageResizer";
const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
// Structured data for SEO - locale-aware
function StructuredData() {
  const locale = useLocale();
  const isZh = locale === "zh";
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: isZh ? "图片尺寸调整" : "Image Resizer",
          operatingSystem: "All",
          applicationCategory: "MultimediaApplication",
          browserRequirements:
            "Requires HTML5 Canvas API and createImageBitmap support",
          url: isZh
            ? "BASE_URL/zh/tools/image-resizer"
            : "BASE_URL/tools/image-resizer",
          description: isZh
            ? "精确调整图片尺寸，可选锁定纵横比。完全使用 Canvas API 在浏览器中运行，无需上传。"
            : "Resize images precisely with optional aspect-ratio lock. Runs entirely in your browser using Canvas. No upload required.",
        }),
      }}
    />
  );
}
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
export default function ImageResizerClient() {
  const t = useTranslations("tools.imageResizer");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] =
    useState<Dimensions | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [isResizing, setIsResizing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = useCallback(
    async (f: File) => {
      setError(null);
      if (!ACCEPTED_MIME.includes(f.type as (typeof ACCEPTED_MIME)[number])) {
        setError(t("errorInvalid"));
        return;
      }
      if (f.size > MAX_SIZE_BYTES) {
        setError(t("errorSize"));
        return;
      }
      setFile(f);
      setResultBlob(null);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
      // Read source dimensions and seed width/height.
      try {
        const bitmap = await createImageBitmap(f);
        const dims: Dimensions = {
          width: bitmap.width,
          height: bitmap.height,
        };
        bitmap.close();
        setOriginalDimensions(dims);
        setWidth(dims.width);
        setHeight(dims.height);
      } catch {
        setError(t("errorInvalid"));
      }
    },
    [t, resultUrl],
  );
  const onWidthChange = useCallback(
    (w: number) => {
      setWidth(w);
      if (lockAspect && originalDimensions && originalDimensions.width > 0) {
        setHeight(
          Math.round((w * originalDimensions.height) / originalDimensions.width),
        );
      }
    },
    [lockAspect, originalDimensions],
  );
  const onHeightChange = useCallback(
    (h: number) => {
      setHeight(h);
      if (lockAspect && originalDimensions && originalDimensions.height > 0) {
        setWidth(
          Math.round((h * originalDimensions.width) / originalDimensions.height),
        );
      }
    },
    [lockAspect, originalDimensions],
  );
  const handleResize = useCallback(async () => {
    if (!file || width <= 0 || height <= 0) return;
    setIsResizing(true);
    setError(null);
    try {
      const blob = await resizeImage(file, width, height);
      setResultBlob(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorTitle"));
    } finally {
      setIsResizing(false);
    }
  }, [file, width, height, resultUrl, t]);
  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setOriginalDimensions(null);
    setWidth(0);
    setHeight(0);
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resultUrl]);
  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    const dotIndex = file.name.lastIndexOf(".");
    const baseName =
      dotIndex >= 0 ? file.name.slice(0, dotIndex) : file.name;
    const ext = dotIndex >= 0 ? file.name.slice(dotIndex) : "";
    a.download = `${baseName}-${width}x${height}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resultBlob, file, width, height]);
  const faqs: { q: string; a: string }[] = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];
  return (
    <div className="min-h-screen bg-canvas">
      <StructuredData />
      <div className="max-w-4xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="image-resizer" />
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <Crop className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("tag")}</span>
          </div>
          <h1
            className="text-display-lg font-serif text-ink mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            {t("title")}
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>
        <div className="mb-8">
        </div>
        {/* Upload Zone */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFileSelect(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="surface-card border-2 border-dashed border-hairline rounded-xl p-xxl text-center cursor-pointer transition-all hover:border-primary hover:bg-surface-cream-strong"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) =>
              e.target.files?.[0] && handleFileSelect(e.target.files[0])
            }
            className="hidden"
          />
          <ImageIcon
            className="w-12 h-12 mx-auto mb-4 text-primary"
            strokeWidth={1.5}
          />
          <h4 className="text-title-md font-sans text-ink mb-2">
            {file ? file.name : t("dropzone")}
          </h4>
          <p className="text-body-sm text-muted">{t("supported")}</p>
        </div>
        {error && (
          <div className="mt-4 surface-card rounded-lg p-md border border-hairline">
            <div className="caption-upper text-muted-soft mb-1">
              {t("errorTitle")}
            </div>
            <p className="text-body-sm text-ink">{error}</p>
          </div>
        )}
        {/* Preview & Controls */}
        {preview && file && originalDimensions && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="caption-upper text-muted-soft mb-2">
                  {t("original")} · {originalDimensions.width}×
                  {originalDimensions.height} · {formatBytes(file.size)}
                </div>
                <div className="rounded-lg overflow-hidden border border-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Original"
                    className="w-full max-h-80 object-contain bg-surface-card"
                  />
                </div>
              </div>
              {resultUrl && resultBlob && (
                <div>
                  <div className="caption-upper text-muted-soft mb-2">
                    {t("resized")} · {width}×{height} ·{" "}
                    {formatBytes(resultBlob.size)}
                  </div>
                  <div className="rounded-lg overflow-hidden border border-hairline">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultUrl}
                      alt="Resized"
                      className="w-full max-h-80 object-contain bg-surface-card"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="surface-card rounded-lg p-lg grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="width"
                  className="caption-upper text-muted-soft block mb-3"
                >
                  {t("width")}
                </label>
                <input
                  id="width"
                  type="number"
                  min="1"
                  max="16384"
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-ink text-body-sm font-mono focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="height"
                  className="caption-upper text-muted-soft block mb-3"
                >
                  {t("height")}
                </label>
                <input
                  id="height"
                  type="number"
                  min="1"
                  max="16384"
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-ink text-body-sm font-mono focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-body-sm text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(e) => setLockAspect(e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  {t("lockAspect")}
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResize}
                disabled={isResizing || width <= 0 || height <= 0}
                className="flex-1 py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isResizing ? "…" : t("resize")}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 surface-card border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-canvas transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t("reset")}
              </button>
            </div>
            {resultBlob && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t("download")}
              </button>
            )}
          </div>
        )}
        {/* Share strip */}
        <div className="mt-8">
          <ShareButtons
            title={{
              en: "Resized an image with aspect-ratio lock — pure Canvas, zero upload. All-in-One Toolbox.",
              zh: "在浏览器里调整了图片尺寸，纵横比锁定，零上传——All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Tell a designer friend",
              zh: "推荐给做设计的朋友",
            }}
            hashtags={["ImageResizer", "Canvas", "AllInOneToolbox"]}
          />
        </div>
        {/* FAQ */}
        <section className="mt-section pt-xl border-t border-hairline">
          <h2 className="text-display-md font-serif text-ink mb-8">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((item, idx) => (
              <details
                key={idx}
                className="group surface-card rounded-lg p-lg"
              >
                <summary className="cursor-pointer text-title-sm font-sans font-medium text-ink hover:text-primary transition-colors">
                  {item.q}
                </summary>
                <p className="mt-3 text-body-md text-body leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
        <ToolPageFooter slug="image-resizer" />
      </div>
    </div>
  );
}
