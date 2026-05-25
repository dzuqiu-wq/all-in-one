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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-ink hover:text-ink no-underline hover:no-underline"
          >
            <span className="spike-mark text-ink" />
            <span className="font-sans text-title-md font-medium">
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
                className="flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors"
              >
                <span>{t("common.tools")}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
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
                  <div className="absolute top-full left-0 mt-2 w-[680px] bg-canvas border border-hairline rounded-xl shadow-lg p-6 grid grid-cols-2 gap-x-6 gap-y-4 z-50">
                    {CATEGORY_ORDER.map((category) => {
                      const categoryTools = TOOLS.filter(
                        (tool) => tool.category === category,
                      );
                      if (categoryTools.length === 0) return null;
                      return (
                        <div key={category}>
                          <h5 className="caption-upper text-muted-soft mb-3 font-sans">
                            {t(CATEGORY_LABEL_KEY[category])}
                          </h5>
                          <ul className="space-y-1.5">
                            {categoryTools.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <li key={tool.slug}>
                                  <Link
                                    href={localized(tool.href)}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-body-sm text-ink hover:bg-surface-card hover:text-primary transition-colors no-underline"
                                  >
                                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
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
              className={`px-3 py-2 text-body-sm font-medium transition-colors no-underline ${
                isActive("/docs")
                  ? "text-primary"
                  : "text-body hover:text-ink"
              }`}
            >
              {t("nav.docs")}
            </Link>
            <Link
              href={aboutHref}
              className={`px-3 py-2 text-body-sm font-medium transition-colors no-underline ${
                isActive("/about")
                  ? "text-primary"
                  : "text-body hover:text-ink"
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
              className="hidden sm:inline-block text-body-sm font-medium text-body hover:text-ink transition-colors no-underline"
            >
              {t("common.github")}
            </a>
            <Link
              href={ctaHref}
              className="px-5 py-2.5 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors no-underline"
            >
              {t("common.tryIt")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
