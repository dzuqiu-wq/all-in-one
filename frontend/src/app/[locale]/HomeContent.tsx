"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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
import {
  CATEGORIES,
  TOOLS,
  type CategoryDescriptor,
  type ToolDescriptor,
} from "@/lib/toolRegistry";
import { SOCIAL } from "@/lib/constants";

export default function HomeContent() {
  const t = useTranslations();
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
      <section className="max-w-[1280px] mx-auto px-6 py-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas-soft rounded-full text-sm text-ink-mute mb-6">
              <span className="w-2 h-2 bg-primary rounded-full" />
              <span>{t("home.brand")}</span>
            </div>
            <h1
              className="text-ink mb-6"
              style={{
                fontSize: "clamp(40px, 6vw, 64px)",
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-1.92px",
              }}
            >
              {t("home.headline")}
              <span className="text-primary">{t("home.headlineAccent")}</span>.
            </h1>
            <p className="text-lg text-body mb-8 leading-relaxed max-w-xl">
              {t("home.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={wordPdfHref}
                className="btn-primary inline-flex items-center gap-2 no-underline"
              >
                {t("home.startWithWordPdf")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#category-digital-legal"
                className="btn-secondary inline-flex items-center gap-2 no-underline"
              >
                {t("home.browseAll")}
              </a>
            </div>
          </div>

          <div className="surface-night rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-error opacity-80" />
              <div className="w-3 h-3 rounded-full bg-warning opacity-80" />
              <div className="w-3 h-3 rounded-full bg-success opacity-80" />
              <span className="ml-3 text-xs font-mono text-on-dark-soft">
                all-in-one.toolbox
              </span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex gap-3">
                <span className="text-on-dark-soft">$</span>
                <span className="text-on-dark">
                  {t("home.terminal.convert")}
                </span>
              </div>
              <div className="text-success">{t("home.terminal.processing")}</div>
              <div className="text-on-dark-soft">
                {t("home.terminal.memoryOnly")}
              </div>
              <div className="text-on-dark-soft">
                {t("home.terminal.streamResponse")}
              </div>
              <div className="text-success">{t("home.terminal.ready")}</div>
              <div className="flex gap-3 pt-2">
                <span className="text-on-dark-soft">$</span>
                <span className="inline-block w-2 h-4 bg-on-dark animate-pulse" />
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
            className="text-ink mb-3"
            style={{
              fontSize: "clamp(26px, 3.2vw, 34px)",
              lineHeight: 1.15,
              letterSpacing: "-0.4px",
              fontWeight: 500,
            }}
          >
            {t(`${category.intlKey}.title`)}
          </h3>
          <p className="text-body leading-relaxed">
            {t(`${category.intlKey}.description`)}
          </p>
        </div>
        <div className="text-xs font-medium text-ink-mute uppercase tracking-wider font-mono whitespace-nowrap">
          {String(categoryTools.length).padStart(2, "0")} {t("common.tools")}
        </div>
      </div>

      <div className="tool-grid">
        {categoryTools.map((tool) => (
          <ToolMatrixCard key={tool.slug} tool={tool} />
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
      className="card-feature group block no-underline hover:no-underline"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-10 h-10 bg-canvas-soft rounded-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-ink" strokeWidth={1.5} />
        </div>
        <span className="text-xs font-medium text-ink-mute px-3 py-1 bg-canvas-soft rounded-full">
          {tool.runtime === "server" ? t("tools.server") : t("tools.browser")}
        </span>
      </div>

      <h4 className="text-lg font-medium text-ink mb-2"
        style={{ marginBottom: "8px" }}>
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
