"use client";

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
import { useLocalizedHref, useCurrentLocale } from "@/i18n/useLocalizedHref";
import { TOOLS } from "@/lib/toolRegistry";

export default function HomeContent() {
  const t = useTranslations();
  const locale = useCurrentLocale();
  const wordPdfHref = useLocalizedHref("/tools/word-to-pdf");

  const toolsWithHrefs = TOOLS.map((tool) => ({
    ...tool,
    href: useLocalizedHref(tool.href),
  }));

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
    <div className="min-h-screen">
      <section
        className="relative overflow-hidden py-20 lg:py-28"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, var(--color-primary) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--color-secondary) 0%, transparent 40%)",
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
                  <span
                    className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  >
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
                  <div className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                    {TOOLS.length}+
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.stats.tools")}
                  </div>
                </div>
                <div className="w-px h-12" style={{ backgroundColor: "var(--color-border)" }} />
                <div>
                  <div className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                    100%
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.stats.private")}
                  </div>
                </div>
                <div className="w-px h-12" style={{ backgroundColor: "var(--color-border)" }} />
                <div>
                  <div className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                    0
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("home.stats.uploads")}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="col-span-2 p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                      {t("home.feature.doc.title")}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {t("home.feature.doc.desc")}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
                >
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  {t("home.feature.image.title")}
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("home.feature.image.desc")}
                </p>
              </div>

              <div
                className="p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--color-muted)", color: "var(--color-primary)" }}
                >
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                  {t("home.feature.dev.title")}
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("home.feature.dev.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="tools"
        className="py-20"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
              }}
            >
              {t("home.toolsSection.title")}
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--color-text-muted)" }}
            >
              {t("home.toolsSection.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {toolsWithHrefs.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  href={tool.href}
                  className="group relative p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: "var(--color-muted)" }}
                  />

                  <div className="relative z-10">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary"
                      style={{
                        backgroundColor: "var(--color-muted)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      {t(`${tool.navKey}.name`)}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {t(`${tool.navKey}.description`)}
                    </p>

                    <div
                      className="absolute top-6 right-6 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                      style={{
                        backgroundColor: "var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
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
              <h3
                className="font-bold text-xl mb-3"
                style={{ color: "var(--color-text)" }}
              >
                {t("home.values.privacy.title")}
              </h3>
              <p
                className="text-base"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <h3
                className="font-bold text-xl mb-3"
                style={{ color: "var(--color-text)" }}
              >
                {t("home.values.speed.title")}
              </h3>
              <p
                className="text-base"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <h3
                className="font-bold text-xl mb-3"
                style={{ color: "var(--color-text)" }}
              >
                {t("home.values.nosignup.title")}
              </h3>
              <p
                className="text-base"
                style={{ color: "var(--color-text-muted)" }}
              >
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
            <h2
              className="font-bold text-2xl mb-4"
              style={{ color: "var(--color-text)" }}
            >
              {t("share.title")}
            </h2>
            <p
              className="text-base mb-8"
              style={{ color: "var(--color-text-muted)" }}
            >
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