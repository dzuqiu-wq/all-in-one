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
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand — Supabase style: green dot + wordmark */}
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-ink hover:text-primary transition-colors no-underline"
          >
            <span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-on-primary">A1</span>
            </span>
            <span className="font-medium text-lg">All-in-One</span>
          </Link>

          {/* Center Navigation — clean text links */}
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
                  <div className="absolute top-full left-0 mt-2 w-[640px] bg-canvas border border-hairline rounded-lg shadow-lg p-6 grid grid-cols-2 gap-6 z-[10000]">
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
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-ink hover:bg-canvas-soft hover:text-primary transition-colors no-underline"
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

          {/* Right Side — Emerald CTA */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-on-primary text-sm font-medium hover:bg-primary-deep transition-colors no-underline"
            >
              {t("common.tryIt")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
