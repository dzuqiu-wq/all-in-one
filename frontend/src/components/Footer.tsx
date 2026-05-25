"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { TOOLS } from "@/lib/toolRegistry";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

export default function Footer() {
  const t = useTranslations();
  const localizedHref = useLocalizedHref;

  const tools = TOOLS.slice(0, 12);

  return (
    <footer className="bg-canvas border-t border-hairline">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href={localizedHref("/")}
              className="flex items-center gap-2 text-ink no-underline hover:no-underline mb-4"
            >
              <span className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-[10px] font-bold text-on-primary">A1</span>
              </span>
              <span className="font-medium">All-in-One</span>
            </Link>
            <p className="text-sm text-ink-mute leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-4">
              {t("footer.tools")}
            </h4>
            <ul className="space-y-2">
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={localizedHref(tool.href)}
                    className="text-sm text-ink-mute hover:text-primary transition-colors no-underline"
                  >
                    {t(`${tool.navKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-4">
              {t("footer.product")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={localizedHref("/docs")}
                  className="text-sm text-ink-mute hover:text-primary transition-colors no-underline"
                >
                  {t("nav.docs")}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/changelog")}
                  className="text-sm text-ink-mute hover:text-primary transition-colors no-underline"
                >
                  {t("footer.changelog")}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/about")}
                  className="text-sm text-ink-mute hover:text-primary transition-colors no-underline"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/privacy")}
                  className="text-sm text-ink-mute hover:text-primary transition-colors no-underline"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium text-ink mb-4">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/dzuqiu-wq/all-in-one"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-mute hover:text-primary transition-colors no-underline"
                >
                  GitHub
                </a>
              </li>
              <li>
                <span className="text-sm text-ink-mute">
                  MIT License
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ink-mute">
            {new Date().getFullYear()} All-in-One Toolbox. {t("footer.madeWith")}
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}