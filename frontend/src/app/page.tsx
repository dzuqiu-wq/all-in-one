"use client";

import { FileText, Image, QrCode, Merge, Zap, Server } from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface ToolCardProps {
  name: string;
  description: string;
  tag: string;
  tagColor?: "green" | "blue";
  location: "Browser Local" | "Cloud Sandbox";
  locationType: "client" | "server";
  icon: React.ElementType;
  href: string;
  status: "available" | "coming-soon";
}

function ToolCard({
  name,
  description,
  tag,
  tagColor = "green",
  location,
  locationType,
  icon: Icon,
  href,
  status,
}: ToolCardProps) {
  const isAvailable = status === "available";
  const glowColor = tagColor === "green" ? "var(--neon-green)" : "var(--neon-blue)";
  const glowRgb = tagColor === "green" ? "0, 255, 102" : "0, 229, 255";

  return (
    <a
      href={isAvailable ? href : undefined}
      className={`
        group relative
        flex flex-col
        p-5 rounded-lg
        bg-[var(--bg-card)]
        border border-[var(--border-default)]
        transition-all duration-300
        ${isAvailable ? "hover:border-opacity-50 cursor-pointer" : "cursor-default opacity-60"}
      `}
      style={{
        ...(isAvailable
          ? {
              "--glow-color": glowColor,
              "--glow-rgb": glowRgb,
            }
          : {}),
      }}
      onMouseEnter={(e) => {
        if (isAvailable) {
          const el = e.currentTarget;
          el.style.borderColor = glowColor;
          el.style.boxShadow = `
            0 0 0 1px ${glowColor},
            0 0 20px rgba(${glowRgb}, 0.15),
            0 0 40px rgba(${glowRgb}, 0.08),
            inset 0 0 20px rgba(${glowRgb}, 0.03)
          `;
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "";
        el.style.boxShadow = "";
      }}
    >
      {/* Status Badge */}
      {!isAvailable && (
        <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded">
          Soon
        </div>
      )}

      {/* Icon & Tag */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: `rgba(${glowRgb}, 0.1)`,
            border: `1px solid rgba(${glowRgb}, 0.2)`,
          }}
        >
          <Icon
            className="w-6 h-6"
            style={{ color: glowColor }}
          />
        </div>
        <span
          className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded"
          style={{
            backgroundColor: `rgba(${glowRgb}, 0.1)`,
            color: glowColor,
            border: `1px solid rgba(${glowRgb}, 0.2)`,
          }}
        >
          {tag}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--neon-green)] transition-colors">
        {name}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
        {description}
      </p>

      {/* Location Tag */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-default)]">
        {locationType === "client" ? (
          <Zap className="w-3 h-3 text-[var(--neon-green)]" />
        ) : (
          <Server className="w-3 h-3 text-[var(--neon-blue)]" />
        )}
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {location}
        </span>
      </div>

      {/* Neon Glow Border Effect (hidden by default) */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(${glowRgb}, 0.02) 50%, transparent 100%)`,
        }}
      />
    </a>
  );
}

const tools: ToolCardProps[] = [
  {
    name: "Word ↔ PDF",
    description: "Convert Word documents to PDF and vice versa with server-side processing.",
    tag: "SERVER-SIDE ULTRA",
    tagColor: "blue",
    location: "Cloud Sandbox",
    locationType: "server",
    icon: FileText,
    href: "/tools/word-to-pdf",
    status: "available",
  },
  {
    name: "PDF Merge/Split",
    description: "Combine multiple PDFs or split large documents with pure client-side processing.",
    tag: "CLIENT-SIDE PURE",
    tagColor: "green",
    location: "Browser Local",
    locationType: "client",
    icon: Merge,
    href: "/tools/pdf-merge-split",
    status: "available",
  },
  {
    name: "Image Optimizer",
    description: "Compress and resize images directly in your browser with zero server upload.",
    tag: "CLIENT-SIDE PURE",
    tagColor: "green",
    location: "Browser Local",
    locationType: "client",
    icon: Image,
    href: "/tools/image-optimizer",
    status: "available",
  },
  {
    name: "QR Code Generator",
    description: "Generate QR codes instantly with customizable colors and sizes.",
    tag: "CLIENT-SIDE PURE",
    tagColor: "green",
    location: "Browser Local",
    locationType: "client",
    icon: QrCode,
    href: "/tools/qrcode-generator",
    status: "available",
  },
];

export default function Home() {
  return (
    <div className="mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="gradient-cyber">ALL-IN-ONE</span>
          <br />
          <span className="text-[var(--text-primary)]">CYBERPUNK TOOLBOX</span>
        </h1>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="px-3 py-1 text-xs font-mono text-[var(--neon-green)] border border-[var(--neon-green)]/30 rounded bg-[var(--neon-green)]/5">
            PURE CLIENT-SIDE
          </span>
          <span className="px-3 py-1 text-xs font-mono text-[var(--neon-blue)] border border-[var(--neon-blue)]/30 rounded bg-[var(--neon-blue)]/5">
            ZERO COST
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
          Open-source developer tools. No signup required. No data leaves your browser.
          <br />
          <span className="text-[var(--text-muted)]">Server-side tools powered by Gotenberg for maximum compatibility.</span>
        </p>
      </section>

      {/* Tools Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
            Featured Tools
          </h2>
          <a href="/tools" className="text-xs font-mono text-[var(--neon-blue)] hover:underline">
            View All →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.name} {...tool} />
          ))}
        </div>
      </section>

      {/* Mid-page Ad Banner */}
      <section className="py-4">
        <AdBanner slot="home-mid-rectangle" format="rectangle" className="mx-auto max-w-[336px]" />
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-[var(--border-default)]">
        {[
          { label: "Tools Available", value: "4", mono: true },
          { label: "Files Processed", value: "12,847", mono: true },
          { label: "Server Uptime", value: "99.9%", mono: true },
          { label: "Data Privacy", value: "100%", mono: true },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-[var(--neon-green)] font-mono">
              {stat.value}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-8 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Ready to boost your workflow?
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Start using our tools now, or contribute to make them even better.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/tools"
            className="px-5 py-2.5 text-sm font-medium bg-[var(--neon-green)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--neon-green)]/90 transition-colors"
          >
            Get Started
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] rounded-md hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-all"
          >
            Contribute on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}