import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

// ---------------------------------------------------------------------------
// Middleware matcher
// ---------------------------------------------------------------------------
// We aggressively EXCLUDE every well-known SEO / static asset path so that
// the next-intl locale router cannot intercept them, redirect them under
// /en or /zh, or wrap them in an HTML locale layout.
//
// Symptom we are fixing: Google Search Console reported "Could not read this
// sitemap" because requests to /sitemap.xml were being redirected by the
// locale middleware before Next.js could serve the raw XML emitted by
// src/app/sitemap.ts.
//
// What is excluded:
//   • api            — server routes (none in this project, kept for safety)
//   • _next/static   — Next.js compiled static assets
//   • _next/image    — Next.js image optimizer endpoint
//   • favicon.ico    — browser favicon
//   • sitemap.xml    — emitted by src/app/sitemap.ts
//   • robots.txt     — emitted by src/app/robots.ts
//   • *.svg / *.png / *.jpg / *.jpeg / *.webp / *.ico / *.gif
//                    — every common image extension that should NOT be
//                      locale-redirected
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.ico|.*\\.gif).*)'
  ]
};
