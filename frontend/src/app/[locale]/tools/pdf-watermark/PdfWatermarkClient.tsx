"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import SampleButton from "@/components/SampleButton";
import ShareButtons from "@/components/ShareButtons";
import { buildSamplePdfFile } from "@/lib/sampleData";
import { WatermarkProcessor } from "@/lib/pdf-watermark/WatermarkProcessor";
import type {
  StampConfig,
  WatermarkConfig,
  TextConfig,
  ProgressState,
  StampShape,
  WatermarkMode,
} from "@/lib/pdf-watermark/types";
interface PdfWatermarkClientProps {
  locale: string;
}
const DEFAULT_STAMP_CONFIG: StampConfig = {
  shape: "circle",
  companyName: "公司名称",
  departmentName: "业务专用章",
  color: "#CC0000",
  size: 200,
  noiseLevel: 0.1,
  starStyle: "fivePoint",
  borderWidth: 3,
  innerCircleRadius: 0.85,
};
const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  mode: "stamp",
  opacity: 0.3,
  rotation: -45,
  scale: 1,
  tileX: 200,
  tileY: 200,
  offsetX: 0,
  offsetY: 0,
  pages: "all",
};
const DEFAULT_TEXT_CONFIG: TextConfig = {
  text: "CONFIDENTIAL",
  fontSize: 48,
  fontFamily: "Helvetica-Bold",
};
export default function PdfWatermarkClient({ locale }: PdfWatermarkClientProps) {
  const t = useTranslations("tools.pdfWatermark");
  // Locale is consumed by next-intl provider; the prop is kept for parity
  // with the server page wrapper and to enable future locale-specific
  // sample assets without churning the public component contract.
  void locale;
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [stampConfig, setStampConfig] = useState<StampConfig>(DEFAULT_STAMP_CONFIG);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);
  const [textConfig, setTextConfig] = useState<TextConfig>(DEFAULT_TEXT_CONFIG);
  const [progress, setProgress] = useState<ProgressState>({
    status: "idle",
    currentPage: 0,
    totalPages: 0,
    percent: 0,
    message: "",
  });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const processorRef = useRef<WatermarkProcessor | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    processorRef.current = new WatermarkProcessor(stampConfig);
  }, []);
  useEffect(() => {
    if (processorRef.current) {
      processorRef.current.updateStampConfig(stampConfig);
    }
  }, [stampConfig]);
  // Bind preview redraw to ALL individual StampConfig fields.
  // Listing each field explicitly guarantees React detects every change
  // even if the parent object reference identity is stable.
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const canvas = previewCanvasRef.current;
      const processor = processorRef.current;
      if (!canvas || !processor) return;
      // Day-1 clear → full redraw via StampRenderer
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      // Renderer internally resets canvas.width/height = stampConfig.size,
      // which also wipes the bitmap — guaranteeing a clean draw.
      const renderer = processor.getStampRenderer();
      renderer.renderToCanvas(canvas);
    }, 50);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    stampConfig.shape,
    stampConfig.companyName,
    stampConfig.departmentName,
    stampConfig.color,
    stampConfig.size,
    stampConfig.noiseLevel,
    stampConfig.starStyle,
    stampConfig.borderWidth,
    stampConfig.innerCircleRadius,
  ]);
  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(t("errorInvalid"));
      return;
    }
    setPdfFile(file);
    setResultBlob(null);
    setError(null);
    setProgress({ status: "idle", currentPage: 0, totalPages: 0, percent: 0, message: "" });
  }, [t]);
  const handleLoadSample = useCallback(async () => {
    const sample = await buildSamplePdfFile({
      title: "Sample contract draft",
      variant: "a",
      pageCount: 2,
    });
    handleFileSelect(sample);
  }, [handleFileSelect]);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);
  const handleGenerate = useCallback(async () => {
    if (!pdfFile || !processorRef.current) return;
    setError(null);
    setResultBlob(null);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const resultBytes = await processorRef.current.processPDF(
        arrayBuffer,
        watermarkConfig,
        textConfig,
        (state) => setProgress({ ...state })
      );
      const blob = new Blob([resultBytes as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress((prev) => ({
        ...prev,
        status: "success",
        percent: 100,
        message: t("success"),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUnexpected"));
      setProgress((prev) => ({
        ...prev,
        status: "error",
      }));
    }
  }, [pdfFile, watermarkConfig, textConfig, t]);
  const handleDownload = useCallback(() => {
    if (!resultBlob || !pdfFile) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile.name.replace(".pdf", "_watermarked.pdf");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [resultBlob, pdfFile]);
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setResultBlob(null);
    setError(null);
    setProgress({ status: "idle", currentPage: 0, totalPages: 0, percent: 0, message: "" });
    setStampConfig(DEFAULT_STAMP_CONFIG);
    setWatermarkConfig(DEFAULT_WATERMARK_CONFIG);
    setTextConfig(DEFAULT_TEXT_CONFIG);
  }, []);
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  const isProcessing = progress.status === "processing";
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="pdf-watermark" />
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">{t("tag")}</div>
          <h1 className="text-display-lg font-serif text-ink mb-4">
            {t("title")}
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>
        <div className="mb-8">
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Watermark Mode Selection */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">
                {t("watermarkMode")}
              </h3>
              <div className="space-y-3">
                {(["text", "stamp", "hybrid"] as WatermarkMode[]).map((mode) => (
                  <label key={mode} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="watermarkMode"
                      value={mode}
                      checked={watermarkConfig.mode === mode}
                      onChange={(e) =>
                        setWatermarkConfig({
                          ...watermarkConfig,
                          mode: e.target.value as WatermarkMode,
                        })
                      }
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-body-sm text-ink group-hover:text-primary transition-colors">
                      {t(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* Stamp Configuration */}
            {(watermarkConfig.mode === "stamp" || watermarkConfig.mode === "hybrid") && (
              <div className="surface-card rounded-xl p-lg">
                <h3 className="text-title-sm font-sans font-medium text-ink mb-4">
                  {t("stampConfig")}
                </h3>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">{t("stampShape")}</label>
                  <div className="flex gap-2">
                    {(["circle", "oval", "rect"] as StampShape[]).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => setStampConfig({ ...stampConfig, shape })}
                        className={`px-4 py-2 rounded-md text-body-sm transition-colors ${
                          stampConfig.shape === shape
                            ? "bg-primary text-on-primary"
                            : "bg-canvas border border-hairline text-ink hover:border-primary"
                        }`}
                      >
                        {t(shape)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">{t("companyName")}</label>
                  <input
                    type="text"
                    value={stampConfig.companyName}
                    onChange={(e) => setStampConfig({ ...stampConfig, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">{t("departmentName")}</label>
                  <input
                    type="text"
                    value={stampConfig.departmentName}
                    onChange={(e) => setStampConfig({ ...stampConfig, departmentName: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">{t("stampColor")}</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={stampConfig.color}
                      onChange={(e) => setStampConfig({ ...stampConfig, color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stampConfig.color}
                      onChange={(e) => setStampConfig({ ...stampConfig, color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">
                    {t("noiseLevel")}: {Math.round(stampConfig.noiseLevel * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={stampConfig.noiseLevel * 100}
                    onChange={(e) =>
                      setStampConfig({ ...stampConfig, noiseLevel: parseInt(e.target.value) / 100 })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}
            {/* Text Configuration */}
            {(watermarkConfig.mode === "text" || watermarkConfig.mode === "hybrid") && (
              <div className="surface-card rounded-xl p-lg">
                <h3 className="text-title-sm font-sans font-medium text-ink mb-4">
                  {t("textConfig")}
                </h3>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">{t("watermarkText")}</label>
                  <input
                    type="text"
                    value={textConfig.text}
                    onChange={(e) => setTextConfig({ ...textConfig, text: e.target.value })}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-body-sm text-ink focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-body-sm text-muted mb-2">
                    {t("fontSize")}: {textConfig.fontSize}pt
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={textConfig.fontSize}
                    onChange={(e) =>
                      setTextConfig({ ...textConfig, fontSize: parseInt(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}
            {/* Watermark Settings */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">
                {t("watermarkSettings")}
              </h3>
              <div className="mb-4">
                <label className="block text-body-sm text-muted mb-2">
                  {t("opacity")}: {Math.round(watermarkConfig.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={watermarkConfig.opacity * 100}
                  onChange={(e) =>
                    setWatermarkConfig({ ...watermarkConfig, opacity: parseInt(e.target.value) / 100 })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-sm text-muted mb-2">
                  {t("rotation")}: {watermarkConfig.rotation}°
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={watermarkConfig.rotation}
                  onChange={(e) =>
                    setWatermarkConfig({ ...watermarkConfig, rotation: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-sm text-muted mb-2">
                  {t("tileX")}: {watermarkConfig.tileX}pt
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={watermarkConfig.tileX}
                  onChange={(e) =>
                    setWatermarkConfig({ ...watermarkConfig, tileX: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-body-sm text-muted mb-2">
                  {t("tileY")}: {watermarkConfig.tileY}pt
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={watermarkConfig.tileY}
                  onChange={(e) =>
                    setWatermarkConfig({ ...watermarkConfig, tileY: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary"
                />
              </div>
            </div>
            {/* PDF Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`surface-card border-2 border-dashed rounded-xl p-xxl text-center cursor-pointer transition-all duration-300 ${
                pdfFile
                  ? "border-primary bg-surface-cream-strong"
                  : "border-hairline hover:border-primary hover:bg-surface-cream-strong"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <FileText className="w-12 h-12 mx-auto mb-4 text-primary" strokeWidth={1.5} />
              <h4 className="text-title-md font-sans text-ink mb-2">
                {pdfFile ? pdfFile.name : t("dropzone")}
              </h4>
              <p className="text-body-sm text-muted">
                {pdfFile ? formatBytes(pdfFile.size) : t("supported")}
              </p>
            </div>
            {!pdfFile && (
              <SampleButton onLoad={handleLoadSample} layout="block" />
            )}
          </div>
          {/* Right Panel - Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="surface-card rounded-xl p-lg">
              <h3 className="text-title-sm font-sans font-medium text-ink mb-4">
                {t("preview")}
              </h3>
              <div className="flex items-center justify-center bg-surface-soft rounded-lg p-8 min-h-[300px]">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[250px] object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            </div>
            {/* Progress Bar */}
            {isProcessing && (
              <div className="surface-card rounded-xl p-lg">
                <div className="mb-2">
                  <div className="flex justify-between text-body-sm mb-1">
                    <span className="text-ink">{progress.message}</span>
                    <span className="text-primary font-medium">{progress.percent}%</span>
                  </div>
                  <div className="h-2 bg-surface-soft rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="surface-card border border-error/30 rounded-lg p-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-sans font-medium text-ink mb-1">{t("errorTitle")}</h5>
                    <p className="text-body-sm text-body">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {resultBlob && (
              <div className="surface-card rounded-xl p-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <h4 className="text-title-md font-sans text-ink">{t("success")}</h4>
                </div>
                <div className="text-body-sm text-muted mb-4">
                  {t("processed")}: {formatBytes(resultBlob.size)}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {!resultBlob ? (
                <button
                  onClick={handleGenerate}
                  disabled={!pdfFile || isProcessing}
                  className={`w-full py-3 text-body-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${
                    pdfFile && !isProcessing
                      ? "bg-primary text-on-primary hover:bg-primary-active"
                      : "bg-surface-soft text-muted cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isProcessing ? t("processing") : t("generate")}
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t("download")}
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-full py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t("reset")}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <ShareButtons
            title={{
              en: "Stamped a PDF with a proper electronic seal — all in the browser. All-in-One Toolbox.",
              zh: "在浏览器内给 PDF 盖了张干净的电子章 —— 零上传。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Pass this along to your finance team",
              zh: "把它转给你的财务同事",
            }}
            hashtags={["EStamp", "PDFWatermark", "AllInOneToolbox"]}
          />
        </div>
        <section className="mt-section pt-xl border-t border-hairline">
          <h2 className="text-display-md font-serif text-ink mb-8">{t("faqTitle")}</h2>
          <div className="space-y-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
              { q: t("faq4Q"), a: t("faq4A") },
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
        <ToolPageFooter slug="pdf-watermark" />
      </div>
    </div>
  );
}