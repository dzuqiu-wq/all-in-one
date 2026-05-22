"use client";

import { useTranslations } from "next-intl";
import ToolArticle from "@/components/ToolArticle";
import RelatedTools from "@/components/RelatedTools";
import { getArticle } from "@/content/articles";
import { useCurrentLocale } from "@/i18n/useLocalizedHref";
import type { ToolSlug } from "@/lib/toolRegistry";

export interface ToolPageFooterProps {
  slug: ToolSlug;
  /** Optional limit on related tools shown. Defaults to 3. */
  relatedLimit?: number;
}

/**
 * Renders the long-form whitepaper article plus the "Related Tools"
 * sidebar at the bottom of any tool page. The layout collapses to a
 * stacked column on narrow viewports and presents article + sidebar
 * side-by-side on wide screens.
 */
export default function ToolPageFooter({
  slug,
  relatedLimit = 3,
}: ToolPageFooterProps) {
  const locale = useCurrentLocale();
  const content = getArticle(slug, locale);
  const t = useTranslations();

  return (
    <>
      <ToolArticle content={content} />

      <section
        className="mt-section pt-xl border-t border-hairline"
        aria-labelledby="cross-tool-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">
          <div>
            <div className="caption-upper text-muted mb-3">
              {t("home.related.eyebrow")}
            </div>
            <h2
              id="cross-tool-heading"
              className="font-serif text-ink mb-4"
              style={{
                fontSize: "clamp(24px, 3vw, 30px)",
                lineHeight: 1.2,
                fontWeight: 400,
              }}
            >
              {t("home.related.title")}
            </h2>
            <p className="text-body-md text-body leading-relaxed max-w-xl">
              {t("home.related.footnote")}
            </p>
          </div>
          <RelatedTools currentSlug={slug} limit={relatedLimit} />
        </div>
      </section>
    </>
  );
}
