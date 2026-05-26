"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Github } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { TOOLS } from "@/lib/toolRegistry";
import { SOCIAL } from "@/lib/constants";
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
    <footer className="bg-canvas border-t border-hairline">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={homeHref} className="inline-flex items-center gap-2 mb-4 no-underline">
              <span className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-on-primary">A1</span>
              </span>
              <span className="font-medium text-ink">All-in-One</span>
            </Link>
            <p className="text-xs text-ink-mute leading-relaxed max-w-xs">
              Privacy-first browser tools. No upload, no tracking.
            </p>
          </div>

          {/* Tools Links — Group 1 */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-3">{t("common.tools")}</h4>
            <ul className="space-y-2">
              {footerTools.slice(0, half).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.localizedHref}
                    className="text-xs text-ink-mute hover:text-ink transition-colors no-underline"
                  >
                    {t(`${tool.navKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools Links — Group 2 */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-3 opacity-0">{t("common.tools")}</h4>
            <ul className="space-y-2">
              {footerTools.slice(half).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.localizedHref}
                    className="text-xs text-ink-mute hover:text-ink transition-colors no-underline"
                  >
                    {t(`${tool.navKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-3">{t("footer.more")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={docsHref} className="text-xs text-ink-mute hover:text-ink transition-colors no-underline">
                  {t("nav.docs")}
                </Link>
              </li>
              <li>
                <Link href={aboutHref} className="text-xs text-ink-mute hover:text-ink transition-colors no-underline">
                  {t("footer.about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-3">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={privacyHref} className="text-xs text-ink-mute hover:text-ink transition-colors no-underline">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href={termsHref} className="text-xs text-ink-mute hover:text-ink transition-colors no-underline">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={cookieHref} className="text-xs text-ink-mute hover:text-ink transition-colors no-underline">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-hairline-cool flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-mute">
            &copy; {currentYear} All-in-One. MIT License.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-mute hover:text-ink transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
