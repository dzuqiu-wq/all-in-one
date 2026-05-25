"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Palette } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import ToolBreadcrumb from "@/components/ToolBreadcrumb";
import ToolPageFooter from "@/components/ToolPageFooter";
import ShareButtons from "@/components/ShareButtons";
import {
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  type HSL,
  type RGB,
} from "@/lib/tools/colorConverter";

const DEFAULT_RGB: RGB = { r: 99, g: 102, b: 241 };

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
            ? "颜色转换器（HEX / RGB / HSL）"
            : "Color Converter (HEX / RGB / HSL)",
          operatingSystem: "All",
          applicationCategory: "DesignApplication",
          browserRequirements: "Requires JavaScript",
          url: isZh
            ? "https://333654.xyz/zh/tools/color-converter"
            : "https://333654.xyz/tools/color-converter",
          description: isZh
            ? "在 HEX、RGB 和 HSL 颜色空间之间转换，实时预览。所有计算在浏览器中完成。"
            : "Convert between HEX, RGB, and HSL color spaces with live preview. All math runs in your browser.",
        }),
      }}
    />
  );
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

export default function ColorConverterClient() {
  const t = useTranslations("tools.colorConverter");

  // Canonical state is RGB; HEX and HSL are derived for display.
  const [rgb, setRgb] = useState<RGB>(DEFAULT_RGB);
  const [hexInput, setHexInput] = useState<string>(rgbToHex(DEFAULT_RGB));
  const [hexError, setHexError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"hex" | "rgb" | "hsl" | null>(null);

  const hex = useMemo(() => rgbToHex(rgb), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);

  // Keep hexInput in sync with canonical RGB unless the user is typing an invalid value.
  const syncHexInput = useCallback((next: RGB) => {
    setHexInput(rgbToHex(next));
    setHexError(null);
  }, []);

  const handleHexChange = useCallback((raw: string) => {
    setHexInput(raw);
    try {
      const next = hexToRgb(raw);
      setRgb(next);
      setHexError(null);
    } catch {
      setHexError("invalid");
    }
  }, []);

  const handleRgbChange = useCallback(
    (channel: keyof RGB, raw: string) => {
      const value = clamp(Number(raw), 0, 255);
      const next: RGB = { ...rgb, [channel]: value };
      setRgb(next);
      syncHexInput(next);
    },
    [rgb, syncHexInput],
  );

  const handleHslChange = useCallback(
    (channel: keyof HSL, raw: string) => {
      const max = channel === "h" ? 360 : 100;
      const value = clamp(Number(raw), 0, max);
      const nextHsl: HSL = { ...hsl, [channel]: value };
      const nextRgb = hslToRgb(nextHsl);
      setRgb(nextRgb);
      syncHexInput(nextRgb);
    },
    [hsl, syncHexInput],
  );

  const handleCopy = useCallback(
    async (kind: "hex" | "rgb" | "hsl", text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(kind);
        window.setTimeout(() => setCopied(null), 1500);
      } catch {
        // Clipboard API unavailable — silently degrade.
      }
    },
    [],
  );

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const faqs: { q: string; a: string }[] = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <StructuredData />

      <div className="max-w-4xl mx-auto px-6 py-section">
        <ToolBreadcrumb slug="color-converter" />

        <div className="mb-12">
          <div className="caption-upper text-muted mb-4 inline-flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" strokeWidth={2} />
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
          <AdBanner slot="colorconverter-top" format="auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Live preview */}
          <div className="md:col-span-2">
            <div className="caption-upper text-muted-soft mb-2">
              {t("preview")}
            </div>
            <div
              className="w-full rounded-lg border border-hairline shadow-sm"
              style={{ height: "16rem", background: hex }}
              aria-label={`Color preview ${hex}`}
            />
            <div className="mt-3 font-mono text-body-sm text-ink">{hex}</div>
          </div>

          {/* Inputs */}
          <div className="md:col-span-3 space-y-4">
            {/* HEX */}
            <div className="surface-card rounded-lg p-md">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="hex"
                    className="caption-upper text-muted-soft block mb-2"
                  >
                    {t("hex")}
                  </label>
                  <input
                    id="hex"
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexChange(e.target.value)}
                    spellCheck={false}
                    className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-ink text-body-sm font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("hex", hex)}
                  className="py-2 px-3 surface-card border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-canvas transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied === "hex" ? "✓" : t("copy")}
                </button>
              </div>
              {hexError && (
                <p className="mt-2 text-body-sm text-ink">
                  {t("errorInvalid")}
                </p>
              )}
            </div>

            {/* RGB */}
            <div className="surface-card rounded-lg p-md">
              <div className="flex items-end gap-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {(["r", "g", "b"] as const).map((ch) => (
                    <div key={ch}>
                      <label
                        htmlFor={`rgb-${ch}`}
                        className="caption-upper text-muted-soft block mb-2"
                      >
                        {`${t("rgb")} · ${ch.toUpperCase()}`}
                      </label>
                      <input
                        id={`rgb-${ch}`}
                        type="number"
                        min={0}
                        max={255}
                        value={rgb[ch]}
                        onChange={(e) => handleRgbChange(ch, e.target.value)}
                        className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-ink text-body-sm font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("rgb", rgbString)}
                  className="py-2 px-3 surface-card border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-canvas transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied === "rgb" ? "✓" : t("copy")}
                </button>
              </div>
              <div className="mt-2 font-mono text-body-sm text-muted">
                {rgbString}
              </div>
            </div>

            {/* HSL */}
            <div className="surface-card rounded-lg p-md">
              <div className="flex items-end gap-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {(["h", "s", "l"] as const).map((ch) => (
                    <div key={ch}>
                      <label
                        htmlFor={`hsl-${ch}`}
                        className="caption-upper text-muted-soft block mb-2"
                      >
                        {`${t("hsl")} · ${ch.toUpperCase()}`}
                      </label>
                      <input
                        id={`hsl-${ch}`}
                        type="number"
                        min={0}
                        max={ch === "h" ? 360 : 100}
                        value={hsl[ch]}
                        onChange={(e) => handleHslChange(ch, e.target.value)}
                        className="w-full px-3 py-2 surface-card border border-hairline rounded-md text-ink text-body-sm font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("hsl", hslString)}
                  className="py-2 px-3 surface-card border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-canvas transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied === "hsl" ? "✓" : t("copy")}
                </button>
              </div>
              <div className="mt-2 font-mono text-body-sm text-muted">
                {hslString}
              </div>
            </div>
          </div>
        </div>

        {/* Share strip */}
        <div className="mt-8">
          <ShareButtons
            title={{
              en: "Converted a color between HEX, RGB, and HSL — pure browser math, zero upload. All-in-One Toolbox.",
              zh: "在浏览器里完成 HEX / RGB / HSL 颜色转换，零上传——All-in-One Toolbox。",
            }}
            eyebrow={{
              en: "Share with a designer friend",
              zh: "推荐给做设计的朋友",
            }}
            hashtags={["ColorConverter", "Design", "AllInOneToolbox"]}
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

        <ToolPageFooter slug="color-converter" />
      </div>
    </div>
  );
}
