"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Copy, Check, QrCode, ArrowLeft, Palette } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
}

const PRESETS: ColorPreset[] = [
  { name: "Claude", fg: "#cc785c", bg: "#faf9f5" },
  { name: "Editorial", fg: "#181715", bg: "#faf9f5" },
  { name: "Cream", fg: "#cc785c", bg: "#efe9de" },
  { name: "Deep Ink", fg: "#faf9f5", bg: "#181715" },
  { name: "Teal", fg: "#5db8a6", bg: "#faf9f5" },
];

export default function QRCodeGeneratorPage() {
  const t = useTranslations("tools.qrcode");
  const homeHref = useLocalizedHref("/");
  const [text, setText] = useState("");
  const [fg, setFg] = useState("#181715");
  const [bg, setBg] = useState("#faf9f5");
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(() => {
    const qrCanvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
    if (!qrCanvas) {
      const svg = document.querySelector("#qr-canvas svg") as SVGElement;
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = size;
      canvas.height = size;
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode-${Date.now()}.png`;
        a.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
      return;
    }
    const url = qrCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  }, [size, bg]);

  const handleCopy = useCallback(async () => {
    const svg = document.querySelector("#qr-canvas svg") as SVGElement;
    if (!svg) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = size;
      canvas.height = size;
      const img = new Image();
      img.onload = async () => {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch {}
  }, [size, bg]);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-5xl mx-auto px-6 py-section">
        <Link href={homeHref} className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink mb-8 no-underline">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

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
          <AdBanner slot="qr-tool-top" format="auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div>
              <label className="caption-upper text-muted-soft block mb-3">{t("content")}</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("placeholder")}
                rows={4}
                className="w-full px-4 py-3 surface-card border border-hairline rounded-md text-ink font-mono text-body-sm resize-none focus:border-primary focus:outline-none"
              />
              <div className="mt-2 text-body-sm text-muted">{text.length} {t("characters")}</div>
            </div>

            <div>
              <label className="caption-upper text-muted-soft block mb-3">{t("size")}: {size}px</label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="caption-upper text-muted-soft block mb-3">{t("errorCorrection")}</label>
              <div className="flex gap-2">
                {(["L", "M", "Q", "H"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 px-3 py-2 text-body-sm font-medium rounded-md transition-colors ${
                      level === l
                        ? "bg-primary text-on-primary"
                        : "bg-canvas border border-hairline text-body hover:text-ink"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="caption-upper text-muted-soft block mb-3">{t("foreground")}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-hairline" />
                  <input type="text" value={fg} onChange={(e) => setFg(e.target.value)} className="flex-1 px-3 py-2 surface-card border border-hairline rounded-md font-mono text-body-sm uppercase" />
                </div>
              </div>
              <div>
                <label className="caption-upper text-muted-soft block mb-3">{t("background")}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-hairline" />
                  <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="flex-1 px-3 py-2 surface-card border border-hairline rounded-md font-mono text-body-sm uppercase" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-muted" />
                <span className="caption-upper text-muted-soft">{t("presets")}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => { setFg(p.fg); setBg(p.bg); }}
                    title={p.name}
                    className="p-2 rounded-md border border-hairline hover:border-primary transition-all"
                  >
                    <div className="w-full aspect-square rounded" style={{ backgroundColor: p.bg, boxShadow: `inset 0 0 0 2px ${p.fg}` }} />
                    <div className="mt-1 text-xs text-muted truncate">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="surface-card rounded-xl p-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className="caption-upper text-muted-soft">{t("preview")}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!text}
                    className="p-2 text-muted hover:text-ink transition-colors disabled:opacity-50"
                    title={t("copy")}
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setText(""); setFg("#181715"); setBg("#faf9f5"); }}
                    className="p-2 text-muted hover:text-ink transition-colors"
                    title={t("reset")}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div id="qr-canvas" className="flex items-center justify-center p-8 rounded-lg" style={{ backgroundColor: bg }}>
                {text ? (
                  <QRCodeSVG value={text} size={size} fgColor={fg} bgColor={bg} level={level} includeMargin={false} />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-hairline rounded">
                    <span className="text-muted text-body-sm">{t("enterText")}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={!text}
              className="w-full py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("download")}
            </button>

            <AdBanner slot="qr-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
          </div>
        </div>

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
      </div>
    </div>
  );
}
