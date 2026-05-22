"use client";

import { useTranslations } from "next-intl";
import Breadcrumb, { type BreadcrumbCrumb } from "@/components/Breadcrumb";
import { getTool, CATEGORIES, type ToolSlug } from "@/lib/toolRegistry";

export interface ToolBreadcrumbProps {
  slug: ToolSlug;
}

/**
 * Renders the canonical breadcrumb for any tool page:
 *
 *   Home > <Category Label> > <Tool Name>
 *
 * The category link points back at the relevant anchor on the homepage
 * so users can jump back to siblings without losing context. Schema.org
 * BreadcrumbList JSON-LD is emitted by the underlying <Breadcrumb>.
 */
export default function ToolBreadcrumb({ slug }: ToolBreadcrumbProps) {
  const t = useTranslations();
  const tool = getTool(slug);
  const category = CATEGORIES.find((c) => c.id === tool.category);

  const crumbs: BreadcrumbCrumb[] = [];

  if (category) {
    crumbs.push({
      label: t(`${category.intlKey}.label`),
      href: `/#category-${category.id}`,
    });
  }

  crumbs.push({
    label: t(`${tool.intlKey}.name`),
  });

  return <Breadcrumb crumbs={crumbs} />;
}
