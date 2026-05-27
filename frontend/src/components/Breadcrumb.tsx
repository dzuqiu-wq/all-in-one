"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLocalizedHref, useCurrentLocale } from "@/i18n/useLocalizedHref";

export interface BreadcrumbCrumb {
  /** Visible label, already localized. */
  label: string;
  /** Path WITHOUT locale prefix; pass `undefined` for the trailing (current) page. */
  href?: string;
}

export interface BreadcrumbProps {
  crumbs: readonly BreadcrumbCrumb[];
}

/**
 * Renders a semantic <nav aria-label="breadcrumb"> list with chevron
 * separators, plus a Schema.org BreadcrumbList JSON-LD block so search
 * engines can surface the hierarchy in SERP rich results. The first
 * crumb is always the localized home link.
 *
 * Usage:
 *   <Breadcrumb crumbs={[
 *     { label: t("nav.documents"), href: "/#category-digital-legal" },
 *     { label: t("tools.pdfWatermark.name") },
 *   ]} />
 */
export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  const locale = useCurrentLocale();
  const homeHref = useLocalizedHref("/");
  const homeLabel = locale === "zh" ? "首页" : "Home";

  // Build the full crumb list with the home root prepended.
  const all: BreadcrumbCrumb[] = [
    { label: homeLabel, href: "/" },
    ...crumbs,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((crumb, idx) => {
      const isLast = idx === all.length - 1;
      const localizedPath = crumb.href
        ? `/${locale}${crumb.href === "/" ? "" : crumb.href}`
        : undefined;
      return {
        "@type": "ListItem",
        position: idx + 1,
        name: crumb.label,
        ...(localizedPath && !isLast
          ? { item: `BASE_URL${localizedPath}` }
          : {}),
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="breadcrumb"
        className="mb-8 text-body-sm"
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-muted">
          <li className="flex items-center">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors no-underline"
              aria-label={homeLabel}
            >
              <Home className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{homeLabel}</span>
            </Link>
          </li>
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                <ChevronRight
                  className="w-3.5 h-3.5 text-muted-soft"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {crumb.href && !isLast ? (
                  <BreadcrumbLink href={crumb.href} label={crumb.label} />
                ) : (
                  <span
                    className={isLast ? "text-ink font-medium" : "text-muted"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

function BreadcrumbLink({ href, label }: { href: string; label: string }) {
  const localized = useLocalizedHref(href);
  return (
    <Link
      href={localized}
      className="text-muted hover:text-ink transition-colors no-underline"
    >
      {label}
    </Link>
  );
}
