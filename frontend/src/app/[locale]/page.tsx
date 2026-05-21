"use client";

import { useTranslations } from "next-intl";
import { FileText, Image as ImageIcon, QrCode, Merge, ArrowRight, Shield, Zap, Lock } from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface Tool {
  name: string;
  description: string;
  category: "document" | "utility";
  type: "client" | "server";
  icon: React.ElementType;
  href: string;
  status: "available" | "coming-soon";
}

const tools: Tool[] = [
  {
    name: "Word → PDF",
    description: "Convert Word documents to PDF with server-side LibreOffice processing for maximum compatibility.",
    category: "document",
    type: "server",
    icon: FileText,
    href: "/tools/word-to-pdf",
    status: "available",
  },
  {
    name: "PDF Merge & Split",
    description: "Combine multiple PDFs or extract pages from documents. Pure browser processing — your files never leave your device.",
    category: "document",
    type: "client",
    icon: Merge,
    href: "/tools/pdf-merge-split",
    status: "available",
  },
  {
    name: "Image Optimizer",
    description: "Compress images and convert to WebP format. Smart compression preserves quality while reducing file size by up to 80%.",
    category: "utility",
    type: "client",
    icon: ImageIcon,
    href: "/tools/image-optimizer",
    status: "available",
  },
  {
    name: "QR Code Generator",
    description: "Generate beautiful, customizable QR codes for URLs, text, and contact information with multiple color presets.",
    category: "utility",
    type: "client",
    icon: QrCode,
    href: "/tools/qrcode-generator",
    status: "available",
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const isAvailable = tool.status === "available";
  const Icon = tool.icon;

  return (
    <a
      href={isAvailable ? tool.href : undefined}
      className={`group block surface-card hairline rounded-lg p-xl transition-all duration-300 ${
        isAvailable ? "hover:bg-surface-cream-strong cursor-pointer" : "opacity-60 cursor-default"
      } no-underline hover:no-underline`}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-canvas rounded-md flex items-center justify-center">
          <Icon className="w-6 h-6 text-ink" strokeWidth={1.5} />
        </div>
        {tool.type === "server" ? (
          <span className="caption-upper text-muted-soft px-3 py-1 bg-canvas rounded-pill">
            Server
          </span>
        ) : (
          <span className="caption-upper text-muted-soft px-3 py-1 bg-canvas rounded-pill">
            Browser
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-display-sm font-serif text-ink mb-3" style={{ marginBottom: "12px" }}>
        {tool.name}
      </h3>
      <p className="text-body-md text-body leading-relaxed mb-6">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 text-body-sm font-medium text-primary group-hover:text-primary-active transition-colors">
        Try it now
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
}

export default function Home() {
  return (
    <div className="bg-canvas">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline */}
          <div>
            <div className="caption-upper text-muted mb-6">
              All-in-One Toolbox
            </div>
            <h1 className="text-display-xl font-serif text-ink mb-6" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>
              Thoughtful tools for{" "}
              <span className="italic text-primary">everyday work</span>.
            </h1>
            <p className="text-title-md text-body mb-8 leading-relaxed max-w-xl">
              A considered collection of document conversion, image optimization, and productivity tools.
              Privacy-first, browser-based processing.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/tools/word-to-pdf"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors no-underline"
              >
                Start with Word → PDF
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#tools"
                className="inline-flex items-center gap-2 px-5 py-3 bg-canvas border border-hairline text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors no-underline"
              >
                Browse all tools
              </a>
            </div>
          </div>

          {/* Right: Visual Card */}
          <div className="surface-dark rounded-xl p-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-error opacity-80" />
              <div className="w-3 h-3 rounded-full bg-warning opacity-80" />
              <div className="w-3 h-3 rounded-full bg-success opacity-80" />
              <span className="ml-3 text-xs font-mono text-on-dark-soft">all-in-one.toolbox</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex gap-3">
                <span className="text-on-dark-soft">$</span>
                <span className="text-on-dark">convert document.docx</span>
              </div>
              <div className="text-success">→ Processing with LibreOffice...</div>
              <div className="text-on-dark-soft">→ Memory-only pipeline (0 disk I/O)</div>
              <div className="text-on-dark-soft">→ Stream response (5s timeout)</div>
              <div className="text-success">✓ document.pdf ready</div>
              <div className="flex gap-3 pt-2">
                <span className="text-on-dark-soft">$</span>
                <span className="inline-block w-2 h-4 bg-on-dark animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Band */}
      <section className="surface-soft border-y border-hairline">
        <div className="max-w-7xl mx-auto px-6 py-xxl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <Shield className="w-6 h-6 text-primary mb-4" strokeWidth={1.5} />
              <h4 className="text-title-md font-sans text-ink mb-2">Privacy by default</h4>
              <p className="text-body-md text-body leading-relaxed">
                Client-side tools process everything in your browser. Your files never touch a server.
              </p>
            </div>
            <div>
              <Zap className="w-6 h-6 text-primary mb-4" strokeWidth={1.5} />
              <h4 className="text-title-md font-sans text-ink mb-2">Built for speed</h4>
              <p className="text-body-md text-body leading-relaxed">
                Server tools use memory-only pipelines with 5-second hard timeouts. No queues, no waiting.
              </p>
            </div>
            <div>
              <Lock className="w-6 h-6 text-primary mb-4" strokeWidth={1.5} />
              <h4 className="text-title-md font-sans text-ink mb-2">Open source</h4>
              <p className="text-body-md text-body leading-relaxed">
                MIT licensed and transparent. Read the code, run it locally, or contribute on GitHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="max-w-7xl mx-auto px-6 py-section">
        <div className="mb-12">
          <div className="caption-upper text-muted mb-4">The collection</div>
          <h2 className="text-display-lg font-serif text-ink mb-4">
            Tools, considered.
          </h2>
          <p className="text-title-md text-body max-w-2xl">
            Each tool is purpose-built for a specific job. Choose between browser-based privacy or
            server-side power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>

      {/* Ad Section */}
      <section className="max-w-7xl mx-auto px-6 pb-section">
        <AdBanner slot="home-mid-rectangle" format="rectangle" className="mx-auto max-w-[728px]" />
      </section>

      {/* CTA Band */}
      <section className="max-w-7xl mx-auto px-6 pb-section">
        <div className="bg-primary rounded-xl p-section text-center">
          <h2 className="text-display-md font-serif text-on-primary mb-6">
            Start with a single task.
          </h2>
          <p className="text-title-md text-on-primary opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you need to convert a document, compress an image, or generate a QR code —
            we have built the right tool for it.
          </p>
          <a
            href="/tools/word-to-pdf"
            className="inline-flex items-center gap-2 px-6 py-3 bg-canvas text-ink text-body-sm font-medium rounded-md hover:bg-surface-card transition-colors no-underline"
          >
            Try Word → PDF
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}