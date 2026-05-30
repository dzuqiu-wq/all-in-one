"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  ChevronDown, 
  Menu, 
  X, 
  LayoutGrid,
  FileText,
  Image,
  Code,
  Shield,
  Hash,
  Lock,
  Link as LinkIcon,
  FileJson,
  QrCode,
  Type,
  FileImage,
  GitBranch,
  Variable,
  Table,
  Sparkles,
  Languages
} from "lucide-react";
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
  const aboutHref = useLocalizedHref("/about");
  const docsHref = useLocalizedHref("/docs");
  const ctaHref = useLocalizedHref("/tools/word-to-pdf");

  const isActive = (path: string) =>
    pathname === path || pathname.endsWith(path);

  const localized = (href: string) => /;

  const toolCategories = CATEGORY_ORDER.map((category) => ({
    key: category,
    label: t(CATEGORY_LABEL_KEY[category]),
    tools: TOOLS.filter((tool) => tool.category === category),
  })).filter((cat) => cat.tools.length > 0);

  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={homeHref}
            className="flex items-center gap-3 group transition-colors duration-200"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              }}
            >
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span 
              className="font-semibold text-lg hidden sm:block"
              style={{ color: 'var(--color-text)' }}
            >
              All-in-One
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-muted"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span>{t("common.tools")}</span>
                <ChevronDown
                  className={w-4 h-4 transition-transform duration-200 }
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] rounded-2xl border shadow-xl z-[10000] animate-scale-in"
                    style={{ 
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="p-6 grid grid-cols-2 gap-6">
                      {toolCategories.map((category) => (
                        <div key={category.key}>
                          <div 
                            className="text-xs font-semibold uppercase tracking-wider mb-4"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {category.label}
                          </div>
                          <div className="space-y-1">
                            {category.tools.map((tool) => {
                              const Icon = tool.icon;
                              return (
                                <Link
                                  key={tool.slug}
                                  href={localized(tool.href)}
                                  onClick={() => setIsDropdownOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 hover:bg-muted group"
                                >
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
                                    style={{ 
                                      backgroundColor: 'var(--color-muted)',
                                      color: 'var(--color-text-secondary)'
                                    }}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div 
                                      className="font-medium text-sm"
                                      style={{ color: 'var(--color-text)' }}
                                    >
                                      {t(${tool.navKey}.name)}
                                    </div>
                                  </div>
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
              className={px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 }
              style={{
                color: isActive("/docs") ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}
            >
              {t("nav.docs")}
            </Link>
            <Link
              href={aboutHref}
              className={px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 }
              style={{
                color: isActive("/about") ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}
            >
              {t("nav.about")}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors duration-150"
              aria-label="Toggle dark mode"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <svg className="w-5 h-5 sun-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg className="w-5 h-5 moon-icon hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <Link
              href={ctaHref}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)'
              }}
            >
              {t("common.tryIt")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-150"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
            <div className="grid grid-cols-2 gap-4">
              {toolCategories.map((category) => (
                <div key={category.key}>
                  <div 
                    className="text-xs font-semibold uppercase tracking-wider mb-3 px-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {category.label}
                  </div>
                  <div className="space-y-1">
                    {category.tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.slug}
                          href={localized(tool.href)}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 hover:bg-muted"
                        >
                          <Icon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                          <span style={{ color: 'var(--color-text)' }}>
                            {t(${tool.navKey}.name)}
                          </span>
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
