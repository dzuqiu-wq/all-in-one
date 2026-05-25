"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Braces,
  Check,
  Copy,
  Eraser,
  Minimize2,
  Sparkles,
  Wand2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import { formatJson, minifyJson, validateJson } from "@/lib/tools/jsonFormatter";

type Indent = 2 | 4;

interface FormatterState {
  output: string;
  error: string | null;
  ok: boolean | null;
}

const SAMPLE_EN = JSON.stringify(
  {
    project: "all-in-one-toolbox",
    license: "MIT",
    counts: { tools: 11, languages: 2 },
    features: ["pure-client-side", "memory-only-pipeline", "no-auth"],
    nested: { ok: true, ratio: 0.9 },
  },
  null,
  0,
);

const SAMPLE_ZH = JSON.stringify(
  {
    项目: "all-in-one-toolbox",
    协议: "MIT",
    工具数量: 11,
    语言: ["zh", "en"],
    特性: ["纯前端", "零落盘", "免登录"],
    嵌套: { 启用: true, 比例: 0.9 },
  },
  null,
  0,
);

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
            name: isZh ? "JSON 格式化与验证器" : "JSON Formatter & Validator",
            operatingSystem: "All",
            applicationCategory: "UtilitiesApplication",
            browserRequirements: "Requires a modern browser with JSON.parse support",
            url: isZh
              ? "https://333654.xyz/zh/tools/json-formatter"
              : "https://333654.xyz/tools/json-formatter",
            description: isZh
              ? "在浏览器内完成 JSON 的格式化、校验与压缩，调用原生 JSON.parse 引擎。符合 ECMA-404 标准，零上传、零落盘。"
              : "Format, validate, and minify JSON entirely client-side via the native JSON.parse engine. ECMA-404 compliant, zero upload.",
          }),
        }}
      />
    </>
  );
}

export default function JsonFormatterClient() {
  const t = useTranslations("tools.jsonFormatter");
  const locale = useLocale();

  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>(2);
  const [state, setState] = useState<FormatterState>({
    output: "",
    error: null,
    ok: null,
  });
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const chars = input.length;
    const lines = input.length === 0 ? 0 : input.split("\n").length;
    return t("stats", { chars: String(chars), lines: String(lines) });
  }, [input, t]);

  const handleFormat = useCallback(() => {
    try {
      const output = formatJson(input, indent);
      setState({ output, error: null, ok: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setState({ output: "", error: message, ok: false });
    }
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    try {
      const output = minifyJson(input);
      setState({ output, error: null, ok: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setState({ output: "", error: message, ok: false });
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    const result = validateJson(input);
    if (result.ok) {
      setState({ output: t("validOk"), error: null, ok: true });
    } else {
      setState({ output: "", error: result.error ?? "", ok: false });
    }
  }, [input, t]);

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
    setState({ output: "", error: null, ok: null });
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(locale === "zh" ? SAMPLE_ZH : SAMPLE_EN);
    setState({ output: "", error: null, ok: null });
  }, [locale]);

  return (
    <div className="min-h-screen bg-canvas">
      <StructuredData />

      <div className="max-w-5xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="json-formatter" />

        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <Braces className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("tag")}</span>
          </div>
          <h1
            className="text-display-lg font-serif text-ink mb-4"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            {t("title")}
          </h1>
          <p className="text-title-md text-body max-w-2xl leading-relaxed">
            {t("lead")}
          </p>
        </div>

        <div className="mb-8">
          <AdBanner slot="json-formatter-top" format="auto" />
        </div>

        {/* ---------------- Controls ---------------- */}
        <div className="surface-card hairline rounded-lg p-6 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="caption-upper text-muted-soft">{t("indent")}</span>
            <div className="inline-flex border border-hairline rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setIndent(2)}
                className={`px-3 py-1.5 text-body-sm font-mono ${
                  indent === 2
                    ? "bg-ink text-canvas"
                    : "bg-canvas text-ink hover:bg-surface-cream-strong"
                }`}
                aria-pressed={indent === 2}
              >
                {t("indent2")}
              </button>
              <button
                type="button"
                onClick={() => setIndent(4)}
                className={`px-3 py-1.5 text-body-sm font-mono border-l border-hairline ${
                  indent === 4
                    ? "bg-ink text-canvas"
                    : "bg-canvas text-ink hover:bg-surface-cream-strong"
                }`}
                aria-pressed={indent === 4}
              >
                {t("indent4")}
              </button>
            </div>
          </div>

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleFormat}
            disabled={!input}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-md font-medium text-body-sm hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className="w-4 h-4" strokeWidth={2} />
            {t("format")}
          </button>
          <button
            type="button"
            onClick={handleMinify}
            disabled={!input}
            className="inline-flex items-center gap-2 px-4 py-2 surface-card hairline rounded-md font-medium text-body-sm text-ink hover:bg-surface-cream-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Minimize2 className="w-4 h-4" strokeWidth={2} />
            {t("minify")}
          </button>
          <button
            type="button"
            onClick={handleValidate}
            disabled={!input}
            className="inline-flex items-center gap-2 px-4 py-2 surface-card hairline rounded-md font-medium text-body-sm text-ink hover:bg-surface-cream-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            {t("validate")}
          </button>
        </div>

        {/* ---------------- Editor grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input pane */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="json-input"
                className="caption-upper text-muted-soft"
              >
                {t("inputLabel")}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                  {t("loadSample")}
                </button>
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
            </div>
            <textarea
              id="json-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
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
                {copied ? t("copied") : t("copy")}
              </button>
            </div>

            {state.ok === false && state.error !== null ? (
              <div
                role="alert"
                className="surface-card border border-primary/40 rounded-md p-4 text-body-sm"
              >
                <div className="inline-flex items-center gap-2 caption-upper text-primary mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                  {t("errorHeading")}
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
                {t("emptyHint")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <ShareButtons
            title={{
              en: "Just formatted and validated a JSON payload entirely in my browser — zero upload, native JSON.parse. All-in-One Toolbox.",
              zh: "刚刚在浏览器里把一份 JSON 美化并校验完毕——零上传、调用原生 JSON.parse。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Found this tool helpful?",
              zh: "觉得这个工具好用？",
            }}
            hashtags={["JSONFormatter", "AllInOneToolbox", "PrivacyTools"]}
          />
        </div>

        <ToolPageFooter slug="json-formatter" />
      </div>
    </div>
  );
}
