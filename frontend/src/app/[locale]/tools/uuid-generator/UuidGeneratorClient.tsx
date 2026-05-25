"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Fingerprint, Check, Copy, Eraser, Wand2 } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import { generateMany } from "@/lib/tools/uuidGenerator";

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
          name: isZh
            ? "UUID 生成器（RFC 4122 v4）"
            : "UUID Generator (RFC 4122 v4)",
          operatingSystem: "All",
          applicationCategory: "UtilitiesApplication",
          browserRequirements:
            "Requires a modern browser with Web Crypto API (crypto.randomUUID or crypto.getRandomValues)",
          url: isZh
            ? "https://333654.xyz/zh/tools/uuid-generator"
            : "https://333654.xyz/tools/uuid-generator",
          description: isZh
            ? "在浏览器中生成密码学随机的 UUID（RFC 4122 v4）。一次最多 10,000 个。无服务器、无追踪。"
            : "Generate cryptographically random UUIDs (RFC 4122 v4) in your browser. Up to 10,000 at once. No server, no tracking.",
        }),
      }}
    />
  );
}

const MIN_COUNT = 1;
const MAX_COUNT = 10000;
const DEFAULT_COUNT = 10;

export default function UuidGeneratorClient() {
  const t = useTranslations("tools.uuidGenerator");

  const [count, setCount] = useState<number>(DEFAULT_COUNT);
  const [ids, setIds] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleGenerate = useCallback(() => {
    setError("");
    try {
      const next = generateMany(count);
      setIds(next);
      setCopied(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("non-negative")) setError(t("errorNegative"));
        else if (err.message.includes("maximum")) setError(t("errorMax"));
        else setError(err.message);
      } else {
        setError(t("errorMax"));
      }
    }
  }, [count, t]);

  const handleCopy = useCallback(async () => {
    if (ids.length === 0) return;
    try {
      await navigator.clipboard.writeText(ids.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write can fail in non-secure contexts; degrade silently.
    }
  }, [ids]);

  const handleClear = useCallback(() => {
    setIds([]);
    setError("");
    setCopied(false);
  }, []);

  const handleCountChange = useCallback((raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setCount(MIN_COUNT);
      return;
    }
    setCount(Math.max(MIN_COUNT, Math.min(MAX_COUNT, parsed)));
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
        <ToolBreadcrumb slug="uuid-generator" />

        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5" strokeWidth={2} />
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
          <AdBanner slot="uuidgen-top" format="auto" />
        </div>

        {/* ---------------- Controls ---------------- */}
        <div className="surface-card hairline rounded-lg p-6 mb-6 space-y-5">
          <div>
            <label
              htmlFor="uuid-count"
              className="text-body-sm text-ink font-medium block mb-2"
            >
              {t("count")}
            </label>
            <input
              id="uuid-count"
              type="number"
              min={MIN_COUNT}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => handleCountChange(e.target.value)}
              className="w-32 px-3 py-2 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-md font-medium text-body-sm hover:bg-primary-active transition-colors"
            >
              <Wand2 className="w-4 h-4" strokeWidth={2} />
              {t("generate")}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={ids.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-body-sm text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              ) : (
                <Copy className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              {t("copyAll")}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={ids.length === 0 && !error}
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
          <textarea
            readOnly
            value={ids.join("\n")}
            placeholder=""
            className="w-full min-h-[240px] px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm resize-y"
            aria-label="UUID output"
          />
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
              en: "Just generated 10,000 RFC 4122 v4 UUIDs entirely in my browser via crypto.randomUUID — zero upload. All-in-One Toolbox.",
              zh: "刚刚在浏览器里通过 crypto.randomUUID 生成了 10,000 个 RFC 4122 v4 UUID——零上传。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Found this tool helpful?",
              zh: "觉得这个工具好用？",
            }}
            hashtags={["UUIDGenerator", "AllInOneToolbox", "DeveloperTools"]}
          />
        </div>

        <ToolPageFooter slug="uuid-generator" />
      </div>
    </div>
  );
}
