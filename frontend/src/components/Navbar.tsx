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
    <header className="sticky top-0 z-50">
      <div className="glass mx-4 mt-4">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link
              href={homeHref}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-mint-deep flex items-center justify-center">
                <span className="text-ink font-bold text-lg">A1</span>
              </div>
              <span className="font-serif text-xl text-ink hidden sm:block">
                All-in-One
              </span>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="glass-hover flex items-center gap-1.5 px-4 py-2 rounded-lg text-ink-soft hover:text-ink transition-all"
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
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] glass p-6 z-50">
                      <div className="grid grid-cols-2 gap-6">
                        {CATEGORY_ORDER.map((category) => {
                          const categoryTools = TOOLS.filter(
                            (tool) => tool.category === category,
                          );
                          if (categoryTools.length === 0) return null;
                          return (
                            <div key={category}>
                              <h5 className="text-xs font-medium text-mint uppercase tracking-wider mb-3">
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
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-ink-soft hover:text-ink hover:bg-white/10 transition-all"
                                      >
                                        <Icon className="w-4 h-4" />
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
                    </div>
                  </>
                )}
              </div>

              <Link
                href={docsHref}
                className={`glass-hover px-4 py-2 rounded-lg transition-all ${
                  isActive("/docs")
                    ? "text-ink bg-white/20"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {t("nav.docs")}
              </Link>
              <Link
                href={aboutHref}
                className={`glass-hover px-4 py-2 rounded-lg transition-all ${
                  isActive("/about")
                    ? "text-ink bg-white/20"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {t("nav.about")}
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href={ctaHref} className="btn-primary">
                {t("common.tryIt")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}