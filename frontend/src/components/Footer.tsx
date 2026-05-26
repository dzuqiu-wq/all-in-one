"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Github } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { TOOLS } from "@/lib/toolRegistry";
import { SOCIAL } from "@/lib/constants";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

export default function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const localizedHref = useLocalizedHref;

  const toolGroups = [
    { title: t("footer.tools"), tools: TOOLS.slice(0, 6) },
    { title: t("footer.more"), tools: TOOLS.slice(6) },
  ];

  return (
    <footer className="mt-section">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="glass p-8 lg:p-12 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <Link
                href={localizedHref("/")}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-mint-deep flex items-center justify-center">
                  <span className="text-ink font-bold text-lg">A1</span>
                </div>
                <span className="font-serif text-xl text-ink">All-in-One</span>
              </Link>
              <p className="text-body text-sm max-w-xs mb-4">
                {t("footer.description")}
              </p>
              <div className="flex items-center gap-4">
                <a
                  href={SOCIAL.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 glass-hover rounded-lg flex items-center justify-center"
                >
                  <Github className="w-4 h-4 text-ink-soft" />
                </a>
              </div>
            </div>

            {/* Tools Links */}
            {toolGroups.map((group) => (
              <div key={group.title}>
                <h4 className="font-medium text-ink mb-4">{group.title}</h4>
                <ul className="space-y-2">
                  {group.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={localizedHref(tool.href)}
                        className="text-body text-sm hover:text-mint transition-colors"
                      >
                        {t(`${tool.navKey}.name`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body text-sm">
              © {currentYear} All-in-One. MIT License.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href={localizedHref("/privacy")}
                className="text-body hover:text-ink transition-colors"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href={localizedHref("/terms")}
                className="text-body hover:text-ink transition-colors"
              >
                {t("footer.terms")}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}