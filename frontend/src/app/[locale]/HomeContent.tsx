"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Shield,
  Zap,
  Lock,
  FileText,
  Image as ImageIcon,
  Code,
} from "lucide-react";
import SystemStatus, { type StatusEntry } from "@/components/SystemStatus";
import ShareButtons from "@/components/ShareButtons";
import { buildLocalizedHref, useCurrentLocale } from "@/i18n/useLocalizedHref";
import { TOOLS } from "@/lib/toolRegistry";

export default function HomeContent() {
  const t = useTranslations();
  const locale = useCurrentLocale();

  // Pre-compute localized hrefs at component level (before any conditionals/loops)
  const wordPdfHref = useMemo(
    () => buildLocalizedHref("/tools/word-to-pdf", locale),
    [locale]
  );

  const toolsWithHrefs = useMemo(
    () =>
      TOOLS.map((tool) => ({
        ...tool,
        id: tool.slug,
        name: t(`${tool.intlKey}.name`),
        description: t(`${tool.intlKey}.description`),
        href: buildLocalizedHref(tool.href, locale),
      })),
    [locale, t]
  );

  const statusEntries: readonly StatusEntry[] = useMemo(
    () => [
      {
        label: t("home.status.gotenberg.label"),
        detail: t("home.status.gotenberg.detail"),
        metric: t("home.status.gotenberg.metric"),
        level: "operational" as const,
      },
      {
        label: t("home.status.workers.label"),
        detail: t("home.status.workers.detail"),
        metric: t("home.status.workers.metric"),
        level: "operational" as const,
      },
      {
        label: t("home.status.ssgCache.label"),
        detail: t("home.status.ssgCache.detail"),
        metric: t("home.status.ssgCache.metric"),
        level: "operational" as const,
      },
      {
        label: t("home.status.cdn.label"),
        detail: t("home.status.cdn.detail"),
        metric: t("home.status.cdn.metric"),
        level: "operational" as const,
      },
    ],
    [t]
  );

  return (
    <div className="min-h-screen">
      <section
        className="relative overflow-hidden py-20 lg:py-28"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, var(--color-primary) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--color-secondary) 0%, transparent 40%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: "var(--color-muted)",
                  color: "var(--color-primary)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
                <span>{t("home.badge.privacy")}</span>
              </div>

              <div className="space-y-4">
                <h1
                  className="font-bold leading-tight"
                  style={{
                    fontSize: "clamp(36px, 5vw, 56px)",
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("home.headline")}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {t("home.headlineAccent")}
                  </span>
                </h1>
                <p
                  className="text-lg lg:text-xl leading-relaxed max-w-xl"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {t("home.subtitle")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={wordPdfHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                  }}
                >
                  <span>{t("home.startWithWordPdf")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#tools"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 border"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    backgroundColor: "transparent",
                  }}
                >
                  <span>{t("home.browseAll")}</span>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    {TOOLS.length}
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.stats.tools")}
                  </div>
                </div>
                <div className="w-px h-12" style={{ backgroundColor: "var(--color-border)" }} />
                <div>
                  <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    100%
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.stats.private")}
                  </div>
                </div>
                <div className="w-px h-12" style={{ backgroundColor: "var(--color-border)" }} />
                <div>
                  <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    0
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.stats.uploads")}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="hidden lg:flex items-center justify-center"
              style={{ minHeight: "400px" }}
            >
              <div
                className="rounded-2xl p-8 w-full max-w-md border"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#22c55e" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                      {t("home.status.gotenberg.label")}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-muted)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "100%",
                        backgroundColor: "#22c55e",
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.status.gotenberg.detail")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-2xl mb-4"
              style={{ color: "var(--color-text)" }}
            >
              {t("home.toolsSection.title")}
            </h2>
            <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
              {t("home.toolsSection.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className="p-6 rounded-xl border transition-all duration-150 hover:scale-105"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                {t("home.section.documentTools")}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("home.feature.doc.description")}
              </p>
            </div>

            <div
              className="p-6 rounded-xl border transition-all duration-150 hover:scale-105"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
              >
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                {t("home.section.imageTools")}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("home.feature.image.description")}
              </p>
            </div>

            <div
              className="p-6 rounded-xl border transition-all duration-150 hover:scale-105"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
              >
                <Code className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                {t("home.section.devTools")}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("home.feature.dev.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="py-16" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {toolsWithHrefs.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group p-4 rounded-xl border transition-all duration-150 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="font-medium text-sm mb-1 group-hover:text-primary transition-colors"
                      style={{ color: "var(--color-text)" }}
                    >
                      {tool.name}
                    </h3>
                    <p className="text-xs line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-3 h-3 flex-shrink-0 mt-1 text-muted group-hover:text-primary transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-20"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="p-8 rounded-2xl text-center"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
              >
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: "var(--color-text)" }}>
                {t("home.values.privacy.title")}
              </h3>
              <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
                {t("home.values.privacy.description")}
              </p>
            </div>

            <div
              className="p-8 rounded-2xl text-center"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
              >
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: "var(--color-text)" }}>
                {t("home.values.speed.title")}
              </h3>
              <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
                {t("home.values.speed.description")}
              </p>
            </div>

            <div
              className="p-8 rounded-2xl text-center"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
              >
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl mb-3" style={{ color: "var(--color-text)" }}>
                {t("home.values.nosignup.title")}
              </h3>
              <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
                {t("home.values.nosignup.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border p-8" style={{ borderColor: "var(--color-border)" }}>
            <SystemStatus
              heading={t("systemStatus.heading")}
              eyebrow={t("systemStatus.eyebrow")}
              nominalLabel={t("systemStatus.nominalLabel")}
              lastVerifiedLabel={t("systemStatus.lastVerifiedLabel")}
              entries={statusEntries}
            />
          </div>
        </div>
      </section>

      <section
        className="py-16 border-t"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-bold text-2xl mb-4" style={{ color: "var(--color-text)" }}>
              {t("share.title")}
            </h2>
            <p className="text-base mb-8" style={{ color: "var(--color-text-muted)" }}>
              {t("share.subtitle")}
            </p>
            <ShareButtons
              title={{
                en: "Check out All-in-One Toolbox - free browser-based tools!",
                zh: "试试 All-in-One 工具箱 - 免费浏览器工具！",
              }}
              hashtags={["PDFTools", "AllInOneToolbox", "BrowserPDF"]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}