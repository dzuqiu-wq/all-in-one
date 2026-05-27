"use client";
import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Key, Check, Copy, Eraser, Wand2, RefreshCw } from "lucide-react";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import {
  estimateStrength,
  generatePassword,
  type PasswordOptions,
  type PasswordStrength,
} from "@/lib/tools/passwordGenerator";
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
          name: isZh ? "密码生成器" : "Password Generator",
          operatingSystem: "All",
          applicationCategory: "UtilitiesApplication",
          browserRequirements:
            "Requires a modern browser with Web Crypto API support (crypto.getRandomValues)",
          url: isZh
            ? "BASE_URL/zh/tools/password-generator"
            : "BASE_URL/tools/password-generator",
          description: isZh
            ? "在浏览器中使用 Web Crypto CSPRNG 生成密码学安全的随机密码。不传输，不存储。"
            : "Generate cryptographically secure passwords in your browser using the Web Crypto CSPRNG. No transmission, no storage.",
        }),
      }}
    />
  );
}
const MIN_LENGTH = 4;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 20;
const STRENGTH_BAR_COLOR: Record<PasswordStrength, string> = {
  weak: "bg-red-500",
  medium: "bg-amber-500",
  strong: "bg-emerald-500",
};
const STRENGTH_BAR_FILL: Record<PasswordStrength, string> = {
  weak: "w-1/3",
  medium: "w-2/3",
  strong: "w-full",
};
export default function PasswordGeneratorClient() {
  const t = useTranslations("tools.passwordGenerator");
  const [length, setLength] = useState<number>(DEFAULT_LENGTH);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [digits, setDigits] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const canGenerate = uppercase || lowercase || digits || symbols;
  const handleGenerate = useCallback(() => {
    if (!canGenerate) {
      setError(t("errorNoClass"));
      return;
    }
    setError("");
    const opts: PasswordOptions = {
      length,
      uppercase,
      lowercase,
      digits,
      symbols,
    };
    try {
      const next = generatePassword(opts);
      setOutput(next);
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorNoClass"));
    }
  }, [canGenerate, length, uppercase, lowercase, digits, symbols, t]);
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail in non-secure contexts; degrade silently.
    }
  }, [output]);
  const handleClear = useCallback(() => {
    setOutput("");
    setError("");
    setCopied(false);
  }, []);
  const strength: PasswordStrength | null = useMemo(
    () => (output ? estimateStrength(output) : null),
    [output],
  );
  const strengthLabel = useMemo(() => {
    if (!strength) return "";
    if (strength === "weak") return t("strengthWeak");
    if (strength === "medium") return t("strengthMedium");
    return t("strengthStrong");
  }, [strength, t]);
  const faqs: { q: string; a: string }[] = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];
  return (
    <div className="min-h-screen bg-canvas">
      <StructuredData />
      <div className="max-w-5xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="password-generator" />
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <Key className="w-3.5 h-3.5" strokeWidth={2} />
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
        <div className="surface-card hairline rounded-lg p-6 mb-6 space-y-5">
          {/* Length slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="pw-length"
                className="text-body-sm text-ink font-medium"
              >
                {t("length")}
              </label>
              <span className="text-body-sm text-ink font-mono tabular-nums">
                {length}
              </span>
            </div>
            <input
              id="pw-length"
              type="range"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          {/* Character class checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="inline-flex items-center gap-2 text-body-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="accent-primary"
              />
              {t("uppercase")}
            </label>
            <label className="inline-flex items-center gap-2 text-body-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
                className="accent-primary"
              />
              {t("lowercase")}
            </label>
            <label className="inline-flex items-center gap-2 text-body-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={digits}
                onChange={(e) => setDigits(e.target.checked)}
                className="accent-primary"
              />
              {t("digits")}
            </label>
            <label className="inline-flex items-center gap-2 text-body-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
                className="accent-primary"
              />
              {t("symbols")}
            </label>
          </div>
          {/* Action row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-md font-medium text-body-sm hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {output ? (
                <RefreshCw className="w-4 h-4" strokeWidth={2} />
              ) : (
                <Wand2 className="w-4 h-4" strokeWidth={2} />
              )}
              {output ? t("regenerate") : t("generate")}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!output && !error}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-body-sm text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" strokeWidth={2} />
              {t("clear")}
            </button>
          </div>
          {error && (
            <p className="text-body-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
        {/* ---------------- Output ---------------- */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="caption-upper text-muted-soft">
              {t("output")}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
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
          {output ? (
            <pre className="w-full min-h-[72px] px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm overflow-auto whitespace-pre-wrap break-all">
              {output}
            </pre>
          ) : (
            <div className="w-full min-h-[72px] px-4 py-3 surface-card border border-hairline rounded-md text-muted-soft text-body-sm font-mono flex items-center justify-center text-center">
              {t("output")}
            </div>
          )}
          {/* Strength meter */}
          {strength && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="caption-upper text-muted-soft">
                  {t("strength")}
                </span>
                <span className="text-body-sm text-ink font-medium">
                  {strengthLabel}
                </span>
              </div>
              <div className="w-full h-2 bg-hairline rounded-full overflow-hidden">
                <div
                  className={`h-full ${STRENGTH_BAR_COLOR[strength]} ${STRENGTH_BAR_FILL[strength]} transition-all`}
                  aria-label={strengthLabel}
                  role="progressbar"
                />
              </div>
            </div>
          )}
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
                <p className="text-body-sm text-body leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12">
          <ShareButtons
            title={{
              en: "Just generated a 20-char password entirely in my browser via Web Crypto CSPRNG — zero upload, zero storage. All-in-One Toolbox.",
              zh: "刚刚在浏览器里通过 Web Crypto CSPRNG 生成了 20 位密码——零上传、零存储。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Found this tool helpful?",
              zh: "觉得这个工具好用？",
            }}
            hashtags={["PasswordGenerator", "AllInOneToolbox", "PrivacyTools"]}
          />
        </div>
        <ToolPageFooter slug="password-generator" />
      </div>
    </div>
  );
}
