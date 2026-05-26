"use client";
import { useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import PseudoProcessor from "@/components/PseudoProcessor";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
interface ConversionResult {
  fileName: string;
  processingTime: string;
  originalSize: number;
  pdfSize: number;
  blob: Blob;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Structured data for SEO - uses useLocale to detect which version to show
function StructuredData() {
  const locale = useLocale();
  const isZh = locale === "zh";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: isZh ? "Excel 转 PDF 转换器" : "Excel to PDF Converter",
            operatingSystem: "All",
            applicationCategory: "BusinessApplication",
            browserRequirements: "Requires HTML5 Canvas API and File API support",
            url: isZh ? "https://333654.xyz/zh/tools/excel-to-pdf" : "https://333654.xyz/tools/excel-to-pdf",
            description: isZh
              ? "使用服务端 LibreOffice 处理将 Excel 表格转换为 PDF。纯内存管道处理，文件绝不上传磁盘。5秒快速超时，100%隐私安全。"
              : "Convert Excel spreadsheets (.xlsx, .xls) to PDF format using server-side LibreOffice processing. Features 5-second timeout, memory-only pipeline, and no file storage.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: isZh ? [
              {
                "@type": "Question",
                name: "转换是如何工作的？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "我们的服务器使用 Gotenberg，一个由强大的 LibreOffice Calc 驱动的文档转换服务提供支持。当您上传 Excel 表格时，它会直接流式传输到内存中，由 LibreOffice 处理后流式返回为 PDF——您的文件永不触碰磁盘。表格、图表与公式都会被保留。这是一个真正的纯内存管道架构。",
                },
              },
              {
                "@type": "Question",
                name: "什么是 5 秒超时限制？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "我们的服务器对所有转换强制执行严格的 5 秒超时限制。这个超时设置确保所有用户都能获得可预测的性能。如果您遇到超时错误，建议尝试更小的工作簿或更简单的格式。",
                },
              },
              {
                "@type": "Question",
                name: "为什么文件大小限制为 5MB？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "结合 5 秒超时限制，5MB 的文件大小限制确保了快速转换和资源公平共享。这个限制是经过仔细权衡的：它足够大以处理大多数日常表格，又足够小以保证在 5 秒内完成处理。",
                },
              },
              {
                "@type": "Question",
                name: "转换过程中我的表格安全吗？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "是的，安全性是我们的首要任务。我们实施零占用（Zero-Footprint）策略：文件完全在服务器内存中使用流式管道处理，从不写入磁盘。所有转换操作都在隔离的内存空间中进行，转换完成后内存缓冲区会立即释放。",
                },
              },
              {
                "@type": "Question",
                name: "支持哪些 Excel 格式？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "我们支持两种主要的 Excel 格式：.xlsx（Office Open XML 格式，自 Microsoft Office 2007 起成为标准格式）和传统的 .xls 格式。为获得最佳转换效果，建议使用 .xlsx 格式配合标准字体。",
                },
              },
              {
                "@type": "Question",
                name: "速率限制是如何工作的？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "每个 IP 地址使用滑动窗口算法限制为每分钟 5 次转换。当您达到限制时，服务器会返回 429 状态码，并在响应头中包含 Retry-After 字段，指示您需要等待多长时间才能再次尝试。",
                },
              },
            ] : [
              {
                "@type": "Question",
                name: "How does the conversion work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our server uses Gotenberg, a powerful document conversion service powered by LibreOffice Calc. When you upload an Excel spreadsheet, it streams directly to memory, gets processed by LibreOffice, and streams back as PDF. Tables, charts, and formulas are preserved. Your file never touches disk — this is a true memory-only pipeline architecture.",
                },
              },
              {
                "@type": "Question",
                name: "What is the 5-second timeout?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our server enforces a strict 5-second timeout for all conversions to ensure fair resource sharing and prevent long-running tasks from blocking other users. If you hit the limit, try a smaller workbook or simpler formatting.",
                },
              },
              {
                "@type": "Question",
                name: "Why is the file size limit 5MB?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Combined with the 5-second timeout, the 5MB limit ensures fast conversions and fair resource sharing. For larger spreadsheets, consider splitting them into smaller sheets first or using desktop software.",
                },
              },
              {
                "@type": "Question",
                name: "Is my spreadsheet secure during conversion?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, security is our top priority. We implement a zero-footprint policy: files are processed entirely in server memory using stream-based pipelines and never written to disk.",
                },
              },
              {
                "@type": "Question",
                name: "What formats are supported?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We support .xlsx (Office Open XML, the standard since 2007) and legacy .xls format. For best results, use .xlsx with standard fonts. VBA macros are stripped during conversion since PDF does not support them. Charts render as static images.",
                },
              },
              {
                "@type": "Question",
                name: "How does rate limiting work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Each IP address is limited to 5 conversions per minute using a sliding window algorithm. If you hit the limit, you will receive a 429 response with a Retry-After header indicating when you can try again.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
export default function ExcelToPDFPage() {
  const t = useTranslations("tools.excelPdf");
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
    const validExt = selectedFile.name.match(/\.(xlsx|xls)$/i);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/convert/excel-to-pdf`, {
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
        fileName: file.name.replace(/\.(xlsx|xls)$/i, ".pdf"),
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
      {/* SEO Structured Data */}
      <StructuredData />
      <PseudoProcessor
        isProcessing={false}
        onComplete={() => {}}
        loadingTexts={loadingTexts}
      />
      <div className="max-w-4xl mx-auto px-6 py-section">
        {/* Breadcrumb */}
        <ToolBreadcrumb slug="excel-to-pdf" />
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
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-primary" strokeWidth={1.5} />
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
          </div>
        )}
        {/* Share strip */}
        <div className="mt-8">
          <ShareButtons
            title={{
              en: "Just converted a .xlsx to PDF in 5 seconds — zero upload, memory-only pipeline. All-in-One Toolbox.",
              zh: "刚刚 5 秒内把 .xlsx 转成 PDF —— 零上传、纯内存管道。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Found this conversion helpful?",
              zh: "觉得这次转换好用？",
            }}
            hashtags={["ExcelToPDF", "AllInOneToolbox", "PrivacyTools"]}
          />
        </div>
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
        <ToolPageFooter slug="excel-to-pdf" />
      </div>
    </div>
  );
}
