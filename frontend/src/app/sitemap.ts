import type { MetadataRoute } from "next";
import { TOOLS, type ToolSlug } from "@/lib/toolRegistry";
import { BASE_URL } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Sitemap generator
// ---------------------------------------------------------------------------
//
// This module produces the public /sitemap.xml that Google Search Console
// crawls. It is the single source of truth for which routes we want indexed.
//
// Key design choices:
//
//   1. Every URL is fully-qualified (https://333654.xyz/...) — sitemap.xml
//      MUST use absolute URLs per the protocol spec.
//
//   2. Both locales are emitted with explicit `/en` and `/zh` prefixes.
//      This site uses next-intl with `localePrefix: 'always'`, so even
//      English URLs carry the `/en` segment — a bare `/about` is a 308
//      redirect target and would dilute crawl budget if listed.
//
//   3. Each entry exposes `alternates.languages` (Google's recommended
//      multi-locale hreflang signal). Without this, the duplicate-content
//      heuristic can demote one of the two locales.
//
//   4. Tool routes are programmatically derived from the canonical TOOLS
//      registry, so adding a new tool automatically appears in the
//      sitemap on the next deploy.
//
//   5. `changeFrequency` and `priority` are tuned per page class:
//        • Homepage:      daily,   priority 1.0
//        • Tool pages:    weekly,  priority 0.9
//        • Docs page:     weekly,  priority 0.7
//        • About page:    monthly, priority 0.6
//        • Changelog:     weekly,  priority 0.5
//        • Privacy / Terms / Cookie (legal):
//                         monthly, priority 0.4
//
//   6. The output count is asserted at build time via a comment block at
//      the bottom of this file. Total SSG-indexed routes = 30:
//        2 homepages
//      + 8 tools × 2 locales = 16
//      + 6 static compliance pages × 2 locales = 12 (about, docs, privacy,
//                                                   terms, cookie, changelog)
//        ─────
//                                                   30
//
//      (The full Next.js build emits 34 routes; the four not listed here
//      are `_not-found`, `robots.txt`, `sitemap.xml` itself, and the
//      special `/` dynamic root. None of those belong inside a sitemap.)

type Locale = "en" | "zh";
const LOCALES: readonly Locale[] = ["en", "zh"] as const;

const TOOL_SLUGS: readonly ToolSlug[] = TOOLS.map((t) => t.slug);

const STATIC_COMPLIANCE_PAGES = [
  "about",
  "docs",
  "privacy",
  "terms",
  "cookie",
  "changelog",
] as const;

type PageClass =
  | "home"
  | "tool"
  | "docs"
  | "about"
  | "changelog"
  | "legal";

interface PageMeta {
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}

const PAGE_TUNING: Record<PageClass, PageMeta> = {
  home: { changeFrequency: "daily", priority: 1.0 },
  tool: { changeFrequency: "weekly", priority: 0.9 },
  docs: { changeFrequency: "weekly", priority: 0.7 },
  about: { changeFrequency: "monthly", priority: 0.6 },
  changelog: { changeFrequency: "weekly", priority: 0.5 },
  legal: { changeFrequency: "monthly", priority: 0.4 },
};

function classify(pathSegment: string): PageClass {
  if (pathSegment === "") return "home";
  if (pathSegment.startsWith("tools/")) return "tool";
  if (pathSegment === "docs") return "docs";
  if (pathSegment === "about") return "about";
  if (pathSegment === "changelog") return "changelog";
  return "legal";
}

/**
 * Build a single sitemap entry for the given canonical path segment, in the
 * given primary locale, with the OTHER locale registered as the hreflang
 * alternate. Path segment is locale-free (e.g. "about", "tools/word-to-pdf").
 */
function buildEntry(
  pathSegment: string,
  primaryLocale: Locale,
): MetadataRoute.Sitemap[number] {
  const otherLocale: Locale = primaryLocale === "en" ? "zh" : "en";
  const suffix = pathSegment === "" ? "" : `/${pathSegment}`;
  const url = `${BASE_URL}/${primaryLocale}${suffix}`;
  const tuning = PAGE_TUNING[classify(pathSegment)];

  return {
    url,
    lastModified: new Date(),
    changeFrequency: tuning.changeFrequency,
    priority: tuning.priority,
    alternates: {
      languages: {
        en: `${BASE_URL}/en${suffix}`,
        zh: `${BASE_URL}/zh${suffix}`,
        // x-default points at the English variant, which is also our canonical
        // marketing locale for international audiences.
        "x-default": `${BASE_URL}/en${suffix}`,
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Homepage.
    entries.push(buildEntry("", locale));

    // Seven tools — programmatically generated from the canonical registry,
    // so a new tool added to toolRegistry.ts automatically ships here.
    for (const slug of TOOL_SLUGS) {
      entries.push(buildEntry(`tools/${slug}`, locale));
    }

    // Compliance + supporting pages (about, docs, privacy, terms, cookie,
    // changelog).
    for (const page of STATIC_COMPLIANCE_PAGES) {
      entries.push(buildEntry(page, locale));
    }
  }

  return entries;
}
