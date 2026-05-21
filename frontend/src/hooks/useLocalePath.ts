"use client";

import { useLocale } from "next-intl";

/**
 * Build a locale-aware URL path
 * @param path - The path without locale prefix (e.g., "/tools/word-to-pdf")
 * @returns Full path with current locale (e.g., "/zh/tools/word-to-pdf" or "/en/tools/word-to-pdf")
 */
export function useLocalePath() {
  const locale = useLocale();
  
  return (path: string): string => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${normalizedPath}`;
  };
}

/**
 * Build locale-aware URL directly (for non-component contexts)
 * @param path - The path without locale prefix
 * @param locale - The current locale ('en' or 'zh')
 * @returns Full path with locale prefix
 */
export function getLocalePath(path: string, locale: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}