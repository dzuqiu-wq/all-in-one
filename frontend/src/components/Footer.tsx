"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Github, Heart } from "lucide-react";
import { TOOLS } from "@/lib/toolRegistry";
import {
  useLocalizedHref,
  useCurrentLocale,
  buildLocalizedHref,
} from "@/i18n/useLocalizedHref";

export default function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const locale = useCurrentLocale();
  
  const homeHref = useLocalizedHref("/");
  const aboutHref = useLocalizedHref("/about");
  const docsHref = useLocalizedHref("/docs");
  const privacyHref = useLocalizedHref("/privacy");
  const termsHref = useLocalizedHref("/terms");
  const cookieHref = useLocalizedHref("/cookie");

  const footerTools = useMemo(
    () =>
      TOOLS.map((tool) => ({
        slug: tool.slug,
        navKey: tool.navKey,
        localizedHref: buildLocalizedHref(tool.href, locale),
      })),
    [locale],
  );

  const half = Math.ceil(TOOLS.length / 2);

  return (
    <footer 
      className="border-t mt-section"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link href={homeHref} className="inline-flex items-center gap-3 mb-6 group">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                All-in-One
              </span>
            </Link>
            <p 
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Privacy-first browser tools. No upload, no tracking. All processing happens locally.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/dzuqiu-wq/all-in-one"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-all duration-150 hover:bg-muted"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {t("common.tools")}
            </h4>
            <ul className="space-y-3">
              {footerTools.slice(0, half).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.localizedHref}
                    className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t(`${tool.navKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {t("common.tools")}
            </h4>
            <ul className="space-y-3">
              {footerTools.slice(half).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.localizedHref}
                    className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t(`${tool.navKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href={aboutHref} 
                  className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link 
                  href={docsHref} 
                  className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {t("nav.docs")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href={privacyHref} 
                  className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link 
                  href={termsHref} 
                  className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link 
                  href={cookieHref} 
                  className="text-sm transition-colors duration-150 hover:text-primary no-underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div 
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div 
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span>&copy; {currentYear} All-in-One.</span>
            <span className="hidden sm:inline">MIT License.</span>
          </div>
          <div 
            className="flex items-center gap-1 text-sm"
            style={{ color: 'var(--color-text-faint)' }}
          >
            <span>Made with</span>
            <Heart className="w-4 h-4 text-error" />
            <span>for the community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}