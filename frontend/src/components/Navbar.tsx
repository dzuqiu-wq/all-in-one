"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const homeHref = useLocalizedHref("/");
  const docsHref = useLocalizedHref("/docs");
  const ctaHref = useLocalizedHref("/tools/word-to-pdf");

  const isActive = (path: string) =>
    pathname === path || pathname.endsWith(path);

  const toolCategories = CATEGORY_ORDER.map((category) => ({
    key: category,
    label: t(CATEGORY_LABEL_KEY[category]),
    tools: TOOLS.filter((tool) => tool.category === category),
  })).filter((cat) => cat.tools.length > 0);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={homeHref}
            className="flex items-center gap-3 group transition-colors duration-200"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden sm:block" style={{ color: "var(--color-text)" }}>
              All-in-One
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-muted"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span>{t("common.tools")}</span>
                <ChevronDown className={isDropdownOpen ? "w-4 h-4 rotate-180" : "w-4 h-4"} />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] rounded-2xl border shadow-xl z-[10000] animate-scale-in"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div className="p-6 grid grid-cols-2 gap-6">
                      {toolCategories.map((category) => (
                        <div key={category.key}>
                          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
                            {category.label}
                          </div>
                          <div className="space-y-1">
                            {category.tools.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <Link
                                  key={tool.slug}
                                  href={`/${locale}${tool.href}`}
                                  onClick={() => setIsDropdownOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 hover:bg-muted group"
                                >
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
                                    style={{ backgroundColor: "var(--color-muted)", color: "var(--color-text-secondary)" }}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                                    {t(`${tool.navKey}.name`)}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href={docsHref}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                color: isActive("/docs") ? "var(--color-primary)" : "var(--color-text-secondary)",
              }}
            >
              {t("nav.docs")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href={ctaHref}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              {t("common.tryIt")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-150"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in" style={{ borderColor: "var(--color-border)" }}>
            <div className="grid grid-cols-2 gap-4">
              {toolCategories.map((category) => (
                <div key={category.key}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: "var(--color-text-muted)" }}>
                    {category.label}
                  </div>
                  <div className="space-y-1">
                    {category.tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/${locale}${tool.href}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 hover:bg-muted"
                        >
                          <Icon className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                          <span style={{ color: "var(--color-text)" }}>{t(`${tool.navKey}.name`)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}