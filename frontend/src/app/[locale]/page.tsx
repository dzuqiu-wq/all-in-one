"use client";

import { useTranslations } from "next-intl";
import { FileText, Image, QrCode, Merge, Zap, Server, Shield, Clock, Smartphone } from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface ToolCardProps {
  nameKey: string;
  descriptionKey: string;
  tagKey: string;
  tagColor?: "green" | "blue";
  locationKey: string;
  locationType: "client" | "server";
  icon: React.ElementType;
  href: string;
  status: "available" | "coming-soon";
}

function ToolCard({
  nameKey,
  descriptionKey,
  tagKey,
  tagColor = "green",
  locationKey,
  locationType,
  icon: Icon,
  href,
  status,
}: ToolCardProps) {
  const t = useTranslations();
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
          {t('common.comingSoon')}
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
          {t(tagKey)}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--neon-green)] transition-colors">
        {t(nameKey)}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">
        {t(descriptionKey)}
      </p>

      {/* Location Tag */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-default)]">
        {locationType === "client" ? (
          <Zap className="w-3 h-3 text-[var(--neon-green)]" />
        ) : (
          <Server className="w-3 h-3 text-[var(--neon-blue)]" />
        )}
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {t(locationKey)}
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
    nameKey: "tools.wordPdf.title",
    descriptionKey: "tools.wordPdf.description",
    tagKey: "tools.wordPdf.tag",
    tagColor: "blue",
    locationKey: "tools.wordPdf.title",
    locationType: "server",
    icon: FileText,
    href: "/tools/word-to-pdf",
    status: "available",
  },
  {
    nameKey: "tools.pdfMerge.title",
    descriptionKey: "tools.pdfMerge.description",
    tagKey: "tools.pdfMerge.tag",
    tagColor: "green",
    locationKey: "tools.pdfMerge.browserLocal",
    locationType: "client",
    icon: Merge,
    href: "/tools/pdf-merge-split",
    status: "available",
  },
  {
    nameKey: "tools.imageOptimizer.title",
    descriptionKey: "tools.imageOptimizer.description",
    tagKey: "tools.imageOptimizer.tag",
    tagColor: "green",
    locationKey: "tools.imageOptimizer.browserLocal",
    locationType: "client",
    icon: Image,
    href: "/tools/image-optimizer",
    status: "available",
  },
  {
    nameKey: "tools.qrcode.title",
    descriptionKey: "tools.qrcode.description",
    tagKey: "tools.qrcode.tag",
    tagColor: "green",
    locationKey: "tools.qrcode.browserLocal",
    locationType: "client",
    icon: QrCode,
    href: "/tools/qrcode-generator",
    status: "available",
  },
  // Coming soon tools
  {
    nameKey: "tools.jsonFormatter.title",
    descriptionKey: "tools.jsonFormatter.description",
    tagKey: "tools.jsonFormatter.tag",
    tagColor: "green",
    locationKey: "tools.jsonFormatter.browserLocal",
    locationType: "client",
    icon: Shield,
    href: "#",
    status: "coming-soon",
  },
  {
    nameKey: "tools.urlEncoder.title",
    descriptionKey: "tools.urlEncoder.description",
    tagKey: "tools.urlEncoder.tag",
    tagColor: "green",
    locationKey: "tools.urlEncoder.browserLocal",
    locationType: "client",
    icon: Clock,
    href: "#",
    status: "coming-soon",
  },
  {
    nameKey: "tools.colorPicker.title",
    descriptionKey: "tools.colorPicker.description",
    tagKey: "tools.colorPicker.tag",
    tagColor: "green",
    locationKey: "tools.colorPicker.browserLocal",
    locationType: "client",
    icon: Smartphone,
    href: "#",
    status: "coming-soon",
  },
  {
    nameKey: "tools.timestamp.title",
    descriptionKey: "tools.timestamp.description",
    tagKey: "tools.timestamp.tag",
    tagColor: "green",
    locationKey: "tools.timestamp.browserLocal",
    locationType: "client",
    icon: Clock,
    href: "#",
    status: "coming-soon",
  },
];

export default function Home() {
  const t = useTranslations();

  return (
    <div className="mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="gradient-cyber">{t('home.title')}</span>
          <br />
          <span className="text-[var(--text-primary)]">{t('home.subtitle')}</span>
        </h1>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="px-3 py-1 text-xs font-mono text-[var(--neon-green)] border border-[var(--neon-green)]/30 rounded bg-[var(--neon-green)]/5">
            {t('home.pureClientSide')}
          </span>
          <span className="px-3 py-1 text-xs font-mono text-[var(--neon-blue)] border border-[var(--neon-blue)]/30 rounded bg-[var(--neon-blue)]/5">
            {t('home.zeroCost')}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
          {t('home.description')}
          <br />
          <span className="text-[var(--text-muted)]">{t('home.serverSideNote')}</span>
        </p>
      </section>

      {/* Tools Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
            {t('home.featuredTools')}
          </h2>
          <a href="/tools" className="text-xs font-mono text-[var(--neon-blue)] hover:underline">
            {t('common.viewAll')} →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
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
          { label: t('home.stats.toolsAvailable'), value: "8", mono: true },
          { label: t('home.stats.filesProcessed'), value: "12,847", mono: true },
          { label: t('home.stats.serverUptime'), value: "99.9%", mono: true },
          { label: t('home.stats.dataPrivacy'), value: "100%", mono: true },
        ].map((stat, index) => (
          <div key={index} className="text-center">
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
          {t('common.readyToBoost')}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('common.startUsingTools')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/tools"
            className="px-5 py-2.5 text-sm font-medium bg-[var(--neon-green)] text-[var(--bg-primary)] rounded-md hover:bg-[var(--neon-green)]/90 transition-colors"
          >
            {t('common.getStarted')}
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] rounded-md hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] transition-all"
          >
            {t('common.contributeOnGithub')}
          </a>
        </div>
      </section>
    </div>
  );
}