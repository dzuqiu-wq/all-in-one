"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";
import { getRelatedTools, type ToolSlug } from "@/lib/toolRegistry";

export interface RelatedToolsProps {
  currentSlug: ToolSlug;
  /** Maximum tools to surface in the sidebar (default 3). */
  limit?: number;
  /** Optional heading override. If omitted, uses the localized default. */
  headingOverride?: string;
}

/**
 * Cross-tool linking sidebar. Renders 2-4 internally linked tools to
 * reinforce the site graph for search-engine crawlers and keep users
 * inside the funnel after they finish processing a file.
 *
 * Positioning is up to the parent (we render a self-contained card
 * with hairline border + transparent background so it slots into any
 * sidebar column or below the FAQ block on narrow viewports).
 */
export default function RelatedTools({
  currentSlug,
  limit = 3,
  headingOverride,
}: RelatedToolsProps) {
  const t = useTranslations();
  const related = getRelatedTools(currentSlug, limit);
  const heading = headingOverride ?? t("home.related.title");
  const cta = t("home.related.cta");

  if (related.length === 0) return null;

  return (
    <aside
      aria-labelledby="related-tools-heading"
      className="surface-card hairline rounded-xl p-lg"
    >
      <div className="caption-upper text-muted-soft mb-3">
        {t("home.related.eyebrow")}
      </div>
      <h2
        id="related-tools-heading"
        className="text-title-lg font-serif text-ink mb-5"
      >
        {heading}
      </h2>

      <ul className="space-y-3">
        {related.map((tool) => (
          <RelatedToolRow key={tool.slug} tool={tool} cta={cta} />
        ))}
      </ul>

      <p className="mt-6 pt-4 border-t border-hairline-soft text-body-sm text-muted leading-relaxed">
        {t("home.related.footnote")}
      </p>
    </aside>
  );
}

interface RelatedToolRowProps {
  tool: ReturnType<typeof getRelatedTools>[number];
  cta: string;
}

function RelatedToolRow({ tool, cta }: RelatedToolRowProps) {
  const t = useTranslations();
  const href = useLocalizedHref(tool.href);
  const Icon = tool.icon;
  const name = t(`${tool.intlKey}.name`);
  const description = t(`${tool.intlKey}.description`);

  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-3 p-3 -mx-3 rounded-md hover:bg-surface-cream-strong transition-colors text-ink hover:text-ink no-underline hover:no-underline"
      >
        <div className="w-9 h-9 flex-shrink-0 bg-canvas rounded-md flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body-sm font-medium text-ink truncate">
              {name}
            </span>
            <ArrowUpRight
              className="w-3.5 h-3.5 text-muted-soft group-hover:text-primary transition-colors flex-shrink-0"
              strokeWidth={1.75}
            />
          </div>
          <p className="text-xs text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
          <span className="mt-1 inline-block text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {cta} →
          </span>
        </div>
      </Link>
    </li>
  );
}
