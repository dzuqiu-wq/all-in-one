"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FileCode2,
  Check,
  Copy,
  Eraser,
  Wand2,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import {
  encodeBase64,
  decodeBase64,
  encodeBase64Url,
  decodeBase64Url,
} from "@/lib/tools/base64";
interface ClientState {
  output: string;
  error: string | null;
}
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
            name: isZh ? "Base64 编解码器" : "Base64 Encoder & Decoder",
            operatingSystem: "All",
            applicationCategory: "UtilitiesApplication",
            browserRequirements:
              "Requires a modern browser with btoa/atob and TextEncoder support",
            url: isZh
              ? "BASE_URL/zh/tools/base64"
              : "BASE_URL/tools/base64",
            description: isZh
              ? "在浏览器中对 Base64 文本进行编码和解码。支持标准和 URL-safe 变体，原生支持 UTF-8。"
              : "Encode and decode Base64 text in your browser. Supports standard and URL-safe variants. UTF-8 friendly.",
          }),
        }}
      />
    </>
  );
}
export default function Base64Client() {
  const t = useTranslations("tools.base64");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [state, setState] = useState<ClientState>({
    output: "",
    error: null,
  });
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => {
    const chars = input.length;
    return `${chars}`;
  }, [input]);
  const handleEncode = useCallback(() => {
    try {
      const output = urlSafe ? encodeBase64Url(input) : encodeBase64(input);
      setState({ output, error: null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setState({ output: "", error: message });
    }
  }, [input, urlSafe]);
  const handleDecode = useCallback(() => {
    try {
      const output = urlSafe ? decodeBase64Url(input) : decodeBase64(input);
      setState({ output, error: null });
    } catch {
      setState({ output: "", error: t("errorInvalid") });
    }
  }, [input, urlSafe, t]);
  const handleCopy = useCallback(async () => {
    if (!state.output) return;
    try {
      await navigator.clipboard.writeText(state.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail in non-secure contexts; degrade silently.
    }
  }, [state.output]);
  const handleClear = useCallback(() => {
    setInput("");
    setState({ output: "", error: null });
  }, []);
  const faqs: { q: string; a: string }[] = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];
  return (
    <div className="min-h-screen bg-canvas">
      <StructuredData />
      <div className="max-w-5xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="base64" />
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5" strokeWidth={2} />
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
        {/* ---------------- Controls ---------------- */}
        <div className="surface-card hairline rounded-lg p-6 mb-6 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-body-sm text-ink">{t("urlSafe")}</span>
          </label>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleEncode}
            disabled={!input}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-md font-medium text-body-sm hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className="w-4 h-4" strokeWidth={2} />
            {t("encode")}
          </button>
          <button
            type="button"
            onClick={handleDecode}
            disabled={!input}
            className="inline-flex items-center gap-2 px-4 py-2 surface-card hairline rounded-md font-medium text-body-sm text-ink hover:bg-surface-cream-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 className="w-4 h-4" strokeWidth={2} />
            {t("decode")}
          </button>
        </div>
        {/* ---------------- Editor grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input pane */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="base64-input"
                className="caption-upper text-muted-soft"
              >
                {t("inputLabel")}
              </label>
              <button
                type="button"
                onClick={handleClear}
                disabled={!input}
                className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" strokeWidth={2} />
                {t("clear")}
              </button>
            </div>
            <textarea
              id="base64-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              rows={18}
              className="w-full px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm resize-y focus:border-primary focus:outline-none"
            />
            <div className="mt-2 text-body-sm text-muted-soft font-mono">
              {stats}
            </div>
          </div>
          {/* Output pane */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="caption-upper text-muted-soft">
                {t("outputLabel")}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!state.output}
                className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                ) : (
                  <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                )}
                {t("copy")}
              </button>
            </div>
            {state.error !== null ? (
              <div
                role="alert"
                className="surface-card border border-primary/40 rounded-md p-4 text-body-sm"
              >
                <div className="inline-flex items-center gap-2 caption-upper text-primary mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                  {t("errorTitle")}
                </div>
                <pre className="font-mono text-ink whitespace-pre-wrap break-words">
                  {state.error}
                </pre>
              </div>
            ) : state.output ? (
              <pre className="w-full min-h-[400px] px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm overflow-auto whitespace-pre-wrap break-words">
                {state.output}
              </pre>
            ) : (
              <div className="w-full min-h-[400px] px-4 py-3 surface-card border border-hairline rounded-md text-muted-soft text-body-sm font-mono flex items-center justify-center text-center">
                {t("outputLabel")}
              </div>
            )}
          </div>
        </div>
        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-display-md font-serif text-ink mb-6">
            {t("faqTitle")}
          </h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="surface-card hairline rounded-lg p-6">
                <h3 className="text-title-md font-medium text-ink mb-2">
                  {f.q}
                </h3>
                <p className="text-body-sm text-body leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12">
          <ShareButtons
            title={{
              en: "Just encoded and decoded a Base64 payload entirely in my browser — zero upload, native btoa/atob. All-in-One Toolbox.",
              zh: "刚刚在浏览器里完成了 Base64 的编解码——零上传、调用原生 btoa/atob。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Found this tool helpful?",
              zh: "觉得这个工具好用？",
            }}
            hashtags={["Base64", "AllInOneToolbox", "PrivacyTools"]}
          />
        </div>
        <ToolPageFooter slug="base64" />
      </div>
    </div>
  );
}
