"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Github,
  Sparkles,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";
import SystemStatus, { type StatusEntry } from "@/components/SystemStatus";
import ShareButtons from "@/components/ShareButtons";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";
import { useMagneticEffect } from "@/hooks/useMagneticEffect";
import {
  CATEGORIES,
  TOOLS,
  type CategoryDescriptor,
  type ToolDescriptor,
} from "@/lib/toolRegistry";
import { SOCIAL } from "@/lib/constants";

export default function HomeContent() {
  const t = useTranslations();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const terminalY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const terminalOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const wordPdfHref = useLocalizedHref("/tools/word-to-pdf");
  const aboutHref = useLocalizedHref("/about");

  const statusEntries: readonly StatusEntry[] = [
    {
      label: t("home.status.gotenberg.label"),
      detail: t("home.status.gotenberg.detail"),
      metric: t("home.status.gotenberg.metric"),
      level: "operational",
    },
    {
      label: t("home.status.workers.label"),
      detail: t("home.status.workers.detail"),
      metric: t("home.status.workers.metric"),
      level: "operational",
    },
    {
      label: t("home.status.ssgCache.label"),
      detail: t("home.status.ssgCache.detail"),
      metric: t("home.status.ssgCache.metric"),
      level: "operational",
    },
    {
      label: t("home.status.cdn.label"),
      detail: t("home.status.cdn.detail"),
      metric: t("home.status.cdn.metric"),
      level: "operational",
    },
  ];

  return (
    <div className="bg-canvas">
      {/* ---------- Hero ---------- */}
      <section className="pt-8 pb-section">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="glass p-8 lg:p-12 rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：标题 */}
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lavender/50 text-ink-soft text-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  {t("home.brand")}
                </span>
                <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-ink leading-tight mb-6">
                  {t("home.headline")}
                  <br />
                  <span className="bg-gradient-to-r from-mint to-lavender bg-clip-text text-transparent">
                    {t("home.headlineAccent")}
                  </span>
                </h1>
                <p className="text-lg text-body mb-8 max-w-md leading-relaxed">
                  {t("home.subtitle")}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={wordPdfHref}
                    className="btn-primary"
                  >
                    {t("home.startWithWordPdf")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#category-digital-legal"
                    className="btn-secondary"
                  >
                    {t("home.browseAll")}
                  </a>
                </div>
              </div>

              {/* 右侧：视觉元素 - 终端模拟 */}
              <div className="relative">
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-mint/60" />
                    <div className="w-3 h-3 rounded-full bg-lavender/60" />
                    <div className="w-3 h-3 rounded-full bg-ink-soft/30" />
                    <span className="ml-3 text-xs font-mono text-ink-soft">
                      all-in-one.toolbox
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex gap-3">
                      <span className="text-ink-soft">$</span>
                      <span className="text-ink">{t("home.terminal.convert")}</span>
                    </div>
                    <div className="text-mint">{t("home.terminal.processing")}</div>
                    <div className="text-ink-soft">{t("home.terminal.memoryOnly")}</div>
                    <div className="text-ink-soft">{t("home.terminal.streamResponse")}</div>
                    <div className="text-mint">{t("home.terminal.ready")}</div>
                    <div className="flex gap-3 pt-2">
                      <span className="text-ink-soft">$</span>
                      <span className="inline-block w-2 h-4 bg-mint animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="bg-canvas-soft border-y border-hairline">
        <div className="max-w-6xl mx-auto px-6 py-xxl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueCard
              icon={Shield}
              title={t("home.values.privacy.title")}
              description={t("home.values.privacy.description")}
            />
            <ValueCard
              icon={Zap}
              title={t("home.values.speed.title")}
              description={t("home.values.speed.description")}
            />
            <ValueCard
              icon={Lock}
              title={t("home.values.opensource.title")}
              description={t("home.values.opensource.description")}
            />
          </div>
        </div>
      </section>

      {/* ---------- Industrial Category Matrix ---------- */}
      <section id="tools" className="max-w-6xl mx-auto px-6 py-section">
        <div className="mb-16 max-w-3xl">
          <div className="caption-upper text-muted mb-4">
            {t("home.categories.eyebrow")}
          </div>
          <h2 className="text-display-lg font-serif text-ink mb-4">
            {t("home.tools.title")}
          </h2>
          <p className="text-title-md text-body leading-relaxed">
            {t("home.tools.description")}
          </p>
        </div>

        <div className="space-y-section">
          {CATEGORIES.map((category) => (
            <CategoryMatrix key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* ---------- Mid Ad ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-section">
        <AdBanner
          slot="home-mid-rectangle"
          format="rectangle"
          className="mx-auto max-w-[728px]"
        />
      </section>

      {/* ---------- Indie Hacker Philosophy ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-section">
        <div className="bg-canvas border border-hairline rounded-xl p-section">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
            <div>
              <div className="text-xs font-medium text-ink-mute uppercase tracking-wider mb-4">
                {t("home.philosophy.eyebrow")}
              </div>
              <h2
                className="text-ink"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 38px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                  fontWeight: 400,
                }}
              >
                {t("home.philosophy.title")}
              </h2>
              <Sparkles
                className="mt-6 w-6 h-6 text-primary"
                strokeWidth={1.5}
              />
            </div>
            <div className="space-y-5 text-body-md text-body leading-relaxed">
              <p>{t("home.philosophy.statement1")}</p>
              <p>{t("home.philosophy.statement2")}</p>
              <p>{t("home.philosophy.statement3")}</p>
              <p className="text-ink font-medium">
                {t("home.philosophy.statement4")}
              </p>
              <a
                href={SOCIAL.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 border border-hairline rounded-md text-sm font-medium text-ink hover:bg-canvas-soft transition-colors no-underline"
              >
                <Github className="w-4 h-4" strokeWidth={1.75} />
                {t("common.contributeOnGithub")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- System Status ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-section">
        <SystemStatus
          heading={t("home.status.title")}
          eyebrow={t("home.status.eyebrow")}
          footnote={t("home.status.footnote")}
          nominalLabel={t("home.status.nominal")}
          lastVerifiedLabel={t("home.status.lastVerified")}
          entries={statusEntries}
        />
      </section>

      {/* ---------- CTA ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-section">
        <div className="bg-ink rounded-xl p-section text-center">
          <h2 className="text-3xl font-medium text-canvas mb-4">
            {t("home.cta.title")}
          </h2>
          <p className="text-title-md text-canvas/80 mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
            {t("home.cta.description")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={wordPdfHref}
              className="btn-primary inline-flex items-center gap-2 no-underline"
            >
              {t("home.cta.button")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={aboutHref}
              className="inline-flex items-center gap-2 px-6 py-3 text-canvas/80 hover:text-canvas text-sm font-medium rounded-md border border-canvas/20 hover:border-canvas/40 transition-colors no-underline"
            >
              {t("footer.about")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer share strip ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-section">
        <ShareButtons
          title={{
            en: "Seven privacy-first browser tools, zero upload — All-in-One Toolbox",
            zh: "八款隐私优先的纯浏览器工具，零上传 —— All-in-One Toolbox",
          }}
          eyebrow={{
            en: "Like the toolbox? Send it forward.",
            zh: "觉得不错？转发一手让更多人看到。",
          }}
          hashtags={["AllInOneToolbox", "IndieHackers", "PrivacyFirst"]}
        />
      </section>
    </div>
  );
}

function MagneticLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, style, handlers } = useMagneticEffect({ strength: 0.4 });

  return (
    <Link
      href={href}
      ref={ref as React.RefObject<HTMLAnchorElement>}
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
      {...handlers}
      className={className}
    >
      {children}
    </Link>
  );
}

interface ValueCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="text-base font-medium text-ink mb-1">{title}</h4>
        <p className="text-sm text-ink-mute leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface CategoryMatrixProps {
  category: CategoryDescriptor;
}

function CategoryMatrix({ category }: CategoryMatrixProps) {
  const t = useTranslations();
  const Icon = category.icon;
  const categoryTools = TOOLS.filter((tool) => tool.category === category.id);

  return (
    <section
      id={`category-${category.id}`}
      className="scroll-mt-24"
      aria-labelledby={`category-${category.id}-title`}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 pb-6 border-b border-hairline">
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-sm text-ink-mute mb-3">
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t(`${category.intlKey}.label`)}</span>
          </div>
          <h3
            id={`category-${category.id}-title`}
            className="text-display-md text-ink mb-3"
            style={{
              fontSize: "clamp(26px, 3.2vw, 34px)",
              lineHeight: 1.15,
              letterSpacing: "-0.4px",
              fontWeight: 400,
            }}
          >
            {t(`${category.intlKey}.title`)}
          </h3>
          <p className="text-body-md text-body leading-relaxed">
            {t(`${category.intlKey}.description`)}
          </p>
        </div>
        <div className="caption-upper text-muted-soft font-mono whitespace-nowrap">
          {String(categoryTools.length).padStart(2, "0")} {t("common.tools")}
        </div>
      </div>

      <div className="bento-grid">
        {categoryTools.map((tool, index) => (
          <div key={tool.slug} className={index === 0 ? "bento-card-lead" : ""}>
            <ToolMatrixCard tool={tool} />
          </div>
        ))}
      </div>
    </section>
  );
}

interface ToolMatrixCardProps {
  tool: ToolDescriptor;
}

function ToolMatrixCard({ tool }: ToolMatrixCardProps) {
  const t = useTranslations();
  const href = useLocalizedHref(tool.href);
  const Icon = tool.icon;

  return (
    <Link
      href={href}
      className="glass-card rounded-xl p-6 group block no-underline hover:no-underline"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-canvas-soft rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-ink" strokeWidth={1.5} />
        </div>
        <span className="text-xs font-medium text-ink-mute px-3 py-1 bg-canvas-soft rounded-full">
          {tool.runtime === "server" ? t("tools.server") : t("tools.browser")}
        </span>
      </div>

      <h4
        className="text-lg font-medium text-ink mb-2"
        style={{ marginBottom: "8px" }}
      >
        {t(`${tool.intlKey}.name`)}
      </h4>
      <p className="text-sm text-ink-mute mb-4 leading-relaxed line-clamp-2">
        {t(`${tool.intlKey}.description`)}
      </p>

      <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
        {t("home.tryItNow")}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
