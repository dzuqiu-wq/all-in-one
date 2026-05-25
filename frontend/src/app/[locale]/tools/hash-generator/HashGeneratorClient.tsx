"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Hash, Check, Copy, Eraser, Wand2 } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import { hashText, type HashAlgorithm } from "@/lib/tools/hash";

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
            name: isZh
              ? "哈希生成器（SHA-1/256/384/512）"
              : "Hash Generator (SHA-1/256/384/512)",
            operatingSystem: "All",
            applicationCategory: "UtilitiesApplication",
            browserRequirements:
              "Requires a modern browser with Web Crypto API support (crypto.subtle.digest)",
            url: isZh
              ? "https://333654.xyz/zh/tools/hash-generator"
              : "https://333654.xyz/tools/hash-generator",
            description: isZh
              ? "在浏览器中使用 Web Crypto API 计算 SHA-1、SHA-256、SHA-384 和 SHA-512 哈希值。无需上传，无追踪。"
              : "Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes in your browser via the native Web Crypto API. No upload, no tracking.",
          }),
        }}
      />
    </>
  );
}

const ALGORITHMS: HashAlgorithm[] = [
  "SHA-1",
  "SHA-256",
  "SHA-384",
  "SHA-512",
];

export default function HashGeneratorClient() {
  const t = useTranslations("tools.hashGenerator");

  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    const digest = await hashText(input, algorithm);
    setOutput(digest);
  }, [input, algorithm]);

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
    setInput("");
    setOutput("");
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
        <ToolBreadcrumb slug="hash-generator" />

        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" strokeWidth={2} />
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
          <AdBanner slot="hashgen-top" format="auto" />
        </div>

        {/* ---------------- Controls ---------------- */}
        <div className="surface-card hairline rounded-lg p-6 mb-6 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <span className="text-body-sm text-ink">{t("algorithm")}</span>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
              className="px-3 py-1.5 surface-card border border-hairline rounded-md text-ink text-body-sm font-mono focus:border-primary focus:outline-none"
            >
              {ALGORITHMS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!input}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-md font-medium text-body-sm hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className="w-4 h-4" strokeWidth={2} />
            {t("generate")}
          </button>
        </div>

        {/* ---------------- Editor ---------------- */}
        <div className="grid grid-cols-1 gap-6">
          {/* Input pane */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="hash-input"
                className="caption-upper text-muted-soft"
              >
                {t("inputLabel")}
              </label>
              <button
                type="button"
                onClick={handleClear}
                disabled={!input && !output}
                className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" strokeWidth={2} />
                {t("clear")}
              </button>
            </div>
            <textarea
              id="hash-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              rows={10}
              className="w-full px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm resize-y focus:border-primary focus:outline-none"
            />
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
                disabled={!output}
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

            {output ? (
              <pre className="w-full min-h-[120px] px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm overflow-auto whitespace-pre-wrap break-all">
                {output}
              </pre>
            ) : (
              <div className="w-full min-h-[120px] px-4 py-3 surface-card border border-hairline rounded-md text-muted-soft text-body-sm font-mono flex items-center justify-center text-center">
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
                <p className="text-body-sm text-body leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <ShareButtons
            title={{
              en: "Just hashed a string with SHA-256 entirely in my browser — zero upload, native Web Crypto. All-in-One Toolbox.",
              zh: "刚刚在浏览器里用 SHA-256 算了一段哈希——零上传，调用原生 Web Crypto。All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Found this tool helpful?",
              zh: "觉得这个工具好用？",
            }}
            hashtags={["HashGenerator", "AllInOneToolbox", "PrivacyTools"]}
          />
        </div>

        <ToolPageFooter slug="hash-generator" />
      </div>
    </div>
  );
}
