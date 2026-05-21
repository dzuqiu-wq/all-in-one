"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const SUPPORTED_LOCALES = ["en", "zh"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Detect current locale with double-redundancy:
 *   1. usePathname() — works even before NextIntlClientProvider rehydrates
 *   2. useLocale()   — server-resolved locale
 * Returns whichever is valid; defaults to "en".
 */
export function useCurrentLocale(): SupportedLocale {
  const pathname = usePathname() || "/";
  const intlLocale = useLocale();

  return useMemo<SupportedLocale>(() => {
    const fromPath = pathname.split("/").filter(Boolean)[0];
    if (SUPPORTED_LOCALES.includes(fromPath as SupportedLocale)) {
      return fromPath as SupportedLocale;
    }
    if (SUPPORTED_LOCALES.includes(intlLocale as SupportedLocale)) {
      return intlLocale as SupportedLocale;
    }
    return "en";
  }, [pathname, intlLocale]);
}

/**
 * Normalize a target path with the current locale prefix.
 *   - "/" or ""              → "/<locale>"
 *   - "/tools/word-to-pdf"   → "/<locale>/tools/word-to-pdf"
 *   - "/en/tools/word-..."   → "/<locale>/tools/word-..." (re-localized)
 *   - "https://..."          → returned unchanged (external URL)
 *   - "#anchor"              → returned unchanged
 */
export function buildLocalizedHref(path: string, locale: SupportedLocale): string {
  if (!path) return `/${locale}`;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("#") || path.startsWith("mailto:") || path.startsWith("tel:")) return path;

  // Strip any leading locale prefix to avoid double-prefixing
  const stripped = path.replace(
    new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})(?=/|$)`),
    ""
  );

  const normalized = stripped.startsWith("/") ? stripped : `/${stripped}`;
  if (normalized === "/") return `/${locale}`;

  return `/${locale}${normalized}`;
}

/**
 * React hook variant — pass a logical path, get a locale-aware href.
 *
 *   const href = useLocalizedHref("/tools/word-to-pdf");
 *   // On /zh → "/zh/tools/word-to-pdf"
 *   // On /en → "/en/tools/word-to-pdf"
 */
export function useLocalizedHref(path: string): string {
  const locale = useCurrentLocale();
  return useMemo(() => buildLocalizedHref(path, locale), [path, locale]);
}

/**
 * Strip the locale prefix from a pathname. Useful for the language switcher
 * when computing the "non-localized" view of the current URL.
 *
 *   "/zh/tools/word-to-pdf" → "/tools/word-to-pdf"
 *   "/en"                    → "/"
 */
export function stripLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(
    new RegExp(`^/(${SUPPORTED_LOCALES.join("|")})(?=/|$)`),
    ""
  );
  return stripped === "" ? "/" : stripped;
}
