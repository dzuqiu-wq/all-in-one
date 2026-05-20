"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, RefreshCw, Copy, Check, QrCode, Palette } from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
}

const CYBERPUNK_PRESETS: ColorPreset[] = [
  { name: "Neon Matrix", fg: "#00FF66", bg: "#08090C" },
  { name: "Cyber Blue", fg: "#00E5FF", bg: "#0D1117" },
  { name: "Deep Void", fg: "#E2E8F0", bg: "#08090C" },
  { name: "Hot Pink", fg: "#FF006E", bg: "#1A0A10" },
  { name: "Golden Hour", fg: "#FFB800", bg: "#1A1400" },
];

export default function QRCodeGeneratorPage() {
  const [inputText, setInputText] = useState<string>("");
  const [fgColor, setFgColor] = useState<string>("#00FF66");
  const [bgColor, setBgColor] = useState<string>("#08090C");
  const [qrSize, setQrSize] = useState<number>(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const loadingTexts = [
    "[ENCODING]: Matrix transformation...",
    "[QR]: Generating pixel matrix...",
    "[OPTIM]: Error correction calibration...",
    "[RENDER]: Finalizing QR code...",
  ];

  const handleDownload = useCallback(() => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    // Get the canvas from qrcode.react
    const qrCanvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
    if (!qrCanvas) return;

    // Create a new canvas with custom colors
    const downloadCanvas = document.createElement("canvas");
    const ctx = downloadCanvas.getContext("2d");
    if (!ctx) return;

    downloadCanvas.width = qrCanvas.width;
    downloadCanvas.height = qrCanvas.height;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Draw QR code
    ctx.drawImage(qrCanvas, 0, 0);

    // Trigger download
    const url = downloadCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [bgColor]);

  const handleCopyToClipboard = useCallback(async () => {
    const qrCanvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
    if (!qrCanvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        qrCanvas.toBlob((b) => resolve(b!), "image/png");
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  }, []);

  const applyPreset = useCallback((preset: ColorPreset) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top Ad Banner */}
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <AdBanner slot="qr-tool-top" format="auto" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            <span className="gradient-cyber">QR CODE GENERATOR</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Matrix-Optimized · Cyberpunk Colors · Instant Download
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Content / URL
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter URL or text to encode..."
                rows={4}
                className="mt-2 w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-mono text-sm resize-none focus:border-[var(--neon-green)] focus:outline-none placeholder:text-[var(--text-muted)]"
              />
              <div className="mt-1 text-[10px] font-mono text-[var(--text-muted)]">
                {inputText.length} characters
              </div>
            </div>

            {/* Size Slider */}
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                QR Size: {qrSize}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="32"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full mt-2 accent-[var(--neon-green)]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mt-1">
                <span>128px</span>
                <span>512px</span>
              </div>
            </div>

            {/* Error Correction Level */}
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Error Correction
              </label>
              <div className="flex gap-2 mt-2">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setErrorLevel(level)}
                    className={`flex-1 px-3 py-2 text-xs font-mono rounded transition-all ${
                      errorLevel === level
                        ? "bg-[var(--neon-green)] text-[var(--bg-primary)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--neon-green)]"
                    }`}
                  >
                    {level} {level === "L" ? "(Low)" : level === "M" ? "(Medium)" : level === "Q" ? "(Quartile)" : "(High)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Foreground
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-[var(--border-default)]"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-[var(--text-primary)] font-mono text-xs uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Background
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-[var(--border-default)]"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-[var(--text-primary)] font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Cyberpunk Presets */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-[var(--neon-blue)]" />
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Cyberpunk Presets
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {CYBERPUNK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    title={preset.name}
                    className="group relative p-2 rounded border border-[var(--border-default)] hover:border-[var(--neon-green)] transition-all"
                  >
                    <div
                      className="w-full aspect-square rounded"
                      style={{
                        backgroundColor: preset.bg,
                        boxShadow: `inset 0 0 0 2px ${preset.fg}`,
                      }}
                    />
                    <div className="mt-1 text-[8px] font-mono text-[var(--text-muted)] truncate group-hover:text-[var(--neon-green)]">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* QR Code Preview */}
            <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[var(--neon-green)]" />
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                    Live Preview
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--neon-green)] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-[var(--neon-green)]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setInputText("");
                      setFgColor("#00FF66");
                      setBgColor("#08090C");
                      setQrSize(256);
                    }}
                    className="p-2 text-[var(--text-muted)] hover:text-[var(--neon-blue)] transition-colors"
                    title="Reset"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* QR Code Display */}
              <div
                ref={qrRef}
                className="flex items-center justify-center p-8 rounded-lg"
                style={{ backgroundColor: bgColor }}
              >
                {inputText ? (
                  <div id="qr-canvas">
                    <QRCodeSVG
                      value={inputText}
                      size={qrSize}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={errorLevel}
                      includeMargin={false}
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-[var(--border-default)] rounded">
                    <span className="text-[var(--text-muted)] text-sm font-mono">
                      Enter text to generate QR
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              {inputText && (
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-default)]">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Data Size</span>
                    <p className="text-sm font-mono text-[var(--text-primary)]">{inputText.length} chars</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Version</span>
                    <p className="text-sm font-mono text-[var(--text-primary)]">Auto ({errorLevel})</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Format</span>
                    <p className="text-sm font-mono text-[var(--neon-green)]">PNG</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!inputText}
              className="w-full py-3 bg-[var(--neon-green)] text-[var(--bg-primary)] font-medium rounded-lg hover:bg-[var(--neon-green)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>

            {/* Bottom Ad */}
            <div className="py-2">
              <AdBanner slot="qr-tool-mid" format="rectangle" className="mx-auto max-w-[336px]" />
            </div>
          </div>
        </div>

        {/* SEO FAQ Section */}
        <section className="mt-16 pt-8 border-t border-[var(--border-default)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Frequently Asked Questions about QR Code Generator
          </h2>
          <div className="space-y-6 text-sm text-[var(--text-secondary)]">
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How do I create a QR code for a website URL?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Simply paste or type your full URL into the content field at the top of our QR code generator.
                The tool automatically detects URLs and encodes them correctly. Most smartphone camera apps
                and QR code scanner applications will recognize the URL and offer to open it in your browser
                when you scan the code.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What is error correction and which level should I use?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                QR codes use error correction to allow scanning even when part of the code is damaged or
                obscured. Levels range from L (7% recovery) to H (30% recovery). Use level L for clean
                environments, M for standard use, Q for industrial settings where damage is possible, and
                H only when the code might be significantly obscured. Higher levels require more modules
                and may result in denser QR patterns.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What types of content can I encode in a QR code?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                QR codes can encode various data types: URLs (web addresses), text messages, email addresses,
                phone numbers, SMS messages, WiFi credentials, vCard contact information, calendar events,
                and more. The data capacity depends on the QR version (1-40) and error correction level.
                Our generator handles all standard formats automatically.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Why should I customize QR code colors?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Custom-colored QR codes help maintain brand consistency and improve visual appeal while
                remaining fully scannable. However, there are important constraints: the foreground and
                background must have sufficient contrast (dark on light or light on dark), and you should
                avoid using red alone for the foreground as many red二维码 scanners struggle with it.
                Our cyberpunk presets are designed for optimal scan reliability.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                How large should my QR code be for reliable scanning?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                The minimum size depends on scanning distance. As a rule of thumb, each QR module (the
                individual black/white squares) should be at least 2-3mm for close-range scanning. For
                distance scanning, increase proportionally. Our generator offers sizes from 128px to 512px,
                which translates to approximately 3cm to 13cm when printed. For billboard or poster use,
                consider sizes of 10cm or larger.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                Can QR codes expire or stop working?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Static QR codes (like those generated here) never expire and will work forever as long
                as the underlying data remains valid. If the QR code encodes a URL, the URL itself might
                become invalid if the target page is removed or changed. For dynamic content that needs
                updating without changing the QR code, you would need a QR code management platform with
                URL redirection capabilities.
              </p>
            </details>
            <details className="group">
              <summary className="cursor-pointer text-[var(--text-primary)] font-medium hover:text-[var(--neon-green)] transition-colors">
                What is the difference between QRCodeSVG and QRCodeCanvas components?
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-[var(--neon-green)]/30">
                Our generator uses the qrcode.react library which provides both SVG and Canvas rendering.
                SVG QR codes are vector-based, meaning they scale infinitely without losing quality and
                are ideal for print materials. Canvas QR codes are raster-based, rendered pixel-by-pixel,
                and are better for dynamic manipulation, real-time updates, or when you need to access
                the raw pixel data. Both render at the same quality; the choice depends on your use case.
              </p>
            </details>
          </div>
        </section>
      </section>
    </div>
  );
}