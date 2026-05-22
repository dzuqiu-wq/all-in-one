"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { ToolIcons, tools } from "./ToolConfig";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine current locale from pathname
  const isZh = pathname.startsWith("/zh");

  const homeHref = useLocalizedHref("/");
  const aboutHref = useLocalizedHref("/about");
  const docsHref = useLocalizedHref("/docs");
  const ctaHref = useLocalizedHref("/tools/word-to-pdf");

  const documentTools = tools.filter((tool) => tool.category === "document");
  const utilityTools = tools.filter((tool) => tool.category === "utility");

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
            <span className="font-sans text-title-md font-medium">All-in-One</span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors"
              >
                <span>{t("common.tools")}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full mt-2 left-0 w-80 bg-canvas border border-hairline rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-3">
                      <div className="px-3 py-1.5 caption-upper text-muted-soft">
                        {t("nav.documents")}
                      </div>
                      {documentTools.map((tool) => (
                        <NavToolLink
                          key={tool.name}
                          tool={tool}
                          localeKey={getLocaleToolKey(tool.href)}
                          onSelect={() => setIsDropdownOpen(false)}
                        />
                      ))}

                      <div className="px-3 py-1.5 mt-3 caption-upper text-muted-soft border-t border-hairline-soft pt-3">
                        {t("nav.utilities")}
                      </div>
                      {utilityTools.map((tool) => (
                        <NavToolLink
                          key={tool.name}
                          tool={tool}
                          localeKey={getLocaleToolKey(tool.href)}
                          onSelect={() => setIsDropdownOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href={aboutHref}
              className="px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors no-underline"
            >
              {t("nav.about")}
            </Link>
            <Link
              href={docsHref}
              className="px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors no-underline"
            >
              {t("nav.docs")}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="https://github.com"
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

function getLocaleToolKey(href: string): string {
  // Map tool href to translation key
  const hrefToKey: Record<string, string> = {
    "/tools/word-to-pdf": "nav.wordPdf",
    "/tools/pdf-merge-split": "nav.pdfMerge",
    "/tools/image-optimizer": "nav.imageOptimizer",
    "/tools/qrcode-generator": "nav.qrcode",
  };
  return hrefToKey[href] || "";
}

interface NavToolLinkProps {
  tool: (typeof tools)[number];
  localeKey: string;
  onSelect: () => void;
}

function NavToolLink({ tool, localeKey, onSelect }: NavToolLinkProps) {
  const t = useTranslations();
  const href = useLocalizedHref(tool.href);
  const Icon = ToolIcons[tool.iconName];

  // Get localized name and description
  const localizedName = localeKey ? t(`${localeKey}.name`) : tool.name;
  const localizedDesc = localeKey ? t(`${localeKey}.description`) : tool.description;

  return (
    <Link
      href={href}
      className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-surface-card transition-colors text-ink hover:text-ink no-underline hover:no-underline"
      onClick={onSelect}
    >
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-body-sm font-medium">{localizedName}</div>
        <div className="text-xs text-muted mt-0.5">{localizedDesc}</div>
      </div>
    </Link>
  );
}