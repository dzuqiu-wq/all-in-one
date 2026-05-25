"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { TOOLS, type ToolCategory } from "@/lib/toolRegistry";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocalizedHref, useCurrentLocale } from "@/i18n/useLocalizedHref";

const CATEGORY_ORDER: ToolCategory[] = [
  "digital-legal",
  "crypto-financial",
  "pixel-image",
  "developer",
];

const CATEGORY_LABEL_KEY: Record<ToolCategory, string> = {
  "digital-legal": "nav.categories.documents",
  "crypto-financial": "nav.categories.business",
  "pixel-image": "nav.categories.media",
  developer: "nav.categories.developer",
};

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname() ?? "/";
  const locale = useCurrentLocale();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const homeHref = useLocalizedHref("/");
  const aboutHref = useLocalizedHref("/about");
  const docsHref = useLocalizedHref("/docs");
  const ctaHref = useLocalizedHref("/tools/word-to-pdf");

  const isActive = (path: string) =>
    pathname === path || pathname.endsWith(path);

  const localized = (href: string) => `/${locale}${href}`;

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-hairline">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-ink hover:text-primary transition-colors no-underline"
          >
            <span className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-on-primary">A1</span>
            </span>
            <span className="font-sans font-medium text-lg">
              All-in-One
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-ink-mute hover:text-ink transition-colors font-medium"
              >
                <span>{t("common.tools")}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-[640px] bg-canvas border border-hairline rounded-lg shadow-lg p-6 grid grid-cols-2 gap-6 z-50">
                    {CATEGORY_ORDER.map((category) => {
                      const categoryTools = TOOLS.filter(
                        (tool) => tool.category === category,
                      );
                      if (categoryTools.length === 0) return null;
                      return (
                        <div key={category}>
                          <h5 className="text-xs font-medium text-ink-mute uppercase tracking-wider mb-3">
                            {t(CATEGORY_LABEL_KEY[category])}
                          </h5>
                          <ul className="space-y-1">
                            {categoryTools.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <li key={tool.slug}>
                                  <Link
                                    href={localized(tool.href)}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-ink hover:bg-canvas-soft hover:text-primary transition-colors no-underline"
                                  >
                                    <Icon className="w-4 h-4 text-ink-mute" />
                                    <span>{t(`${tool.navKey}.name`)}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <Link
              href={docsHref}
              className={`px-3 py-2 text-sm font-medium transition-colors no-underline ${
                isActive("/docs")
                  ? "text-primary"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {t("nav.docs")}
            </Link>
            <Link
              href={aboutHref}
              className={`px-3 py-2 text-sm font-medium transition-colors no-underline ${
                isActive("/about")
                  ? "text-primary"
                  : "text-ink-mute hover:text-ink"
              }`}
            >
              {t("nav.about")}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="https://github.com/dzuqiu-wq/all-in-one"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-ink-mute hover:text-ink transition-colors no-underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <Link
              href={ctaHref}
              className="btn-primary"
            >
              {t("common.tryIt")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}