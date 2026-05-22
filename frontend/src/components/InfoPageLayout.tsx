"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

export interface InfoPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated?: string;
  lastUpdatedLabel?: string;
  backLabel: string;
  children: React.ReactNode;
}

export default function InfoPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  lastUpdatedLabel,
  backLabel,
  children,
}: InfoPageLayoutProps) {
  const homeHref = useLocalizedHref("/");

  return (
    <div className="bg-canvas">
      <article className="max-w-3xl mx-auto px-6 py-section">
        <Link
          href={homeHref}
          className="group inline-flex items-center gap-2 text-body-sm font-medium text-muted hover:text-primary transition-colors duration-200 no-underline mb-12"
        >
          <ArrowLeft
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            strokeWidth={1.75}
          />
          {backLabel}
        </Link>

        <header className="mb-16 pb-12 border-b border-hairline">
          <div className="caption-upper text-muted mb-6">{eyebrow}</div>
          <h1
            className="font-serif text-ink mb-6"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              fontWeight: 400,
            }}
          >
            {title}
          </h1>
          <p className="text-title-md text-body leading-relaxed">{description}</p>
          {lastUpdated && (
            <p className="mt-8 inline-block text-xs font-mono text-muted-soft tracking-wider uppercase px-3 py-1.5 surface-card rounded-pill">
              {lastUpdatedLabel ?? "Last updated"}: {lastUpdated}
            </p>
          )}
        </header>

        <div className="info-prose space-y-12">{children}</div>

        <div className="mt-section pt-12 border-t border-hairline">
          <Link
            href={homeHref}
            className="group inline-flex items-center gap-2 px-5 py-3 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors duration-200 no-underline"
          >
            <ArrowLeft
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
              strokeWidth={1.75}
            />
            {backLabel}
          </Link>
        </div>
      </article>
    </div>
  );
}

export interface InfoSectionProps {
  id?: string;
  heading: string;
  children: React.ReactNode;
}

export function InfoSection({ id, heading, children }: InfoSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2
        className="font-serif text-ink mb-6"
        style={{
          fontSize: "clamp(28px, 3.5vw, 36px)",
          lineHeight: 1.15,
          letterSpacing: "-0.5px",
          fontWeight: 400,
        }}
      >
        {heading}
      </h2>
      <div className="space-y-4 text-body-md text-body leading-relaxed">{children}</div>
    </section>
  );
}

export interface InfoSubsectionProps {
  heading: string;
  children: React.ReactNode;
}

export function InfoSubsection({ heading, children }: InfoSubsectionProps) {
  return (
    <div className="mt-8">
      <h3 className="text-title-lg font-sans font-medium text-ink mb-3">{heading}</h3>
      <div className="space-y-3 text-body-md text-body leading-relaxed">{children}</div>
    </div>
  );
}

export function InfoCallout({
  tone = "default",
  children,
}: {
  tone?: "default" | "dark" | "warning";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "dark"
      ? "surface-dark text-on-dark border-transparent"
      : tone === "warning"
      ? "bg-surface-cream-strong text-ink border-hairline"
      : "surface-soft text-body border-hairline";

  return (
    <div
      className={`my-6 p-6 rounded-lg border ${toneClass} text-body-md leading-relaxed`}
    >
      {children}
    </div>
  );
}
