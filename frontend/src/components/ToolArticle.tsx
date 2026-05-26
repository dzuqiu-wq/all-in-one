"use client";

import { useTranslations } from "next-intl";
import {
  ScrollText,
  Cpu,
  LifeBuoy,
} from "lucide-react";

export interface ArticleSubsection {
  /** Localized H3 heading. */
  heading: string;
  /** Localized paragraphs. Each entry becomes a <p>. */
  paragraphs: readonly string[];
}

export interface ArticleSection {
  /** Translation key suffix under tools.<key>.article.* — e.g. "industry". */
  id: "industry" | "underTheHood" | "troubleshooting";
  /** Localized H2 heading. */
  heading: string;
  /** Localized lead paragraph rendered above the subsections. */
  lead: string;
  /** Localized subsection list. */
  subsections: readonly ArticleSubsection[];
  /** Optional list of bullet items rendered below the subsections. */
  bullets?: readonly string[];
}

export interface ToolArticleContent {
  /** Localized eyebrow (e.g. "WHITEPAPER · CANVAS PIPELINE"). */
  eyebrow: string;
  /** Localized H1-style title. */
  title: string;
  /** Localized lead paragraph displayed under the title. */
  lead: string;
  /** Three sections: industry context, technical deep dive, troubleshooting. */
  sections: readonly [ArticleSection, ArticleSection, ArticleSection];
}

export interface ToolArticleProps {
  content: ToolArticleContent;
}

/**
 * Renders the three required long-form sections (industry context, technical
 * deep dive, troubleshooting guide) below the interactive tool surface.
 *
 * Each tool page passes a locale-resolved `content` payload. The component
 * does not perform translation itself — it just renders the prose so the
 * caller controls bilingual selection through `getArticle(slug, locale)`.
 */
export default function ToolArticle({ content }: ToolArticleProps) {
  const t = useTranslations();

  const sectionIcons: Record<ArticleSection["id"], typeof ScrollText> = {
    industry: ScrollText,
    underTheHood: Cpu,
    troubleshooting: LifeBuoy,
  };

  return (
    <article className="mt-section pt-xl border-t border-hairline">
      <header className="mb-12 max-w-3xl">
        <div
          className="text-xs font-medium text-ink-mute uppercase tracking-wider mb-4"
        >
          {content.eyebrow}
        </div>
        <h2
          className="text-ink mb-6"
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.72px",
          }}
        >
          {content.title}
        </h2>
        <p className="text-body leading-relaxed">{content.lead}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        {/* Side rail: table of contents */}
        <nav
          aria-label={t("article.tableOfContents")}
          className="hidden lg:block"
        >
          <div className="sticky top-24">
            <div className="text-xs font-medium text-ink-mute uppercase tracking-wider mb-4">
              {t("article.tableOfContents")}
            </div>
            <ol className="space-y-1">
              {content.sections.map((section, idx) => {
                const Icon = sectionIcons[section.id];
                return (
                  <li key={section.id}>
                    <a
                      href={`#article-${section.id}`}
                      className="flex items-start gap-2 px-3 py-2 rounded-sm text-sm text-ink-mute hover:text-ink hover:bg-canvas-soft transition-all no-underline"
                    >
                      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-ink-faint" strokeWidth={1.75} />
                      <span>
                        <span className="font-mono text-xs text-ink-faint mr-1.5">
                          0{idx + 1}
                        </span>
                        {section.heading}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        {/* Main column */}
        <div className="space-y-16 max-w-3xl">
          {content.sections.map((section, idx) => (
            <section
              key={section.id}
              id={`article-${section.id}`}
              className="scroll-mt-24"
            >
              <div className="text-xs font-mono font-medium text-ink-faint mb-3 border-b border-hairline-cool pb-3">
                {`0${idx + 1} · ${
                  section.id === "industry"
                    ? t("article.industry")
                    : section.id === "underTheHood"
                      ? t("article.underTheHood")
                      : t("article.troubleshooting")
                }`}
              </div>
              <h3
                className="text-ink mb-5"
                style={{
                  fontSize: "clamp(24px, 3vw, 30px)",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  letterSpacing: "-0.42px",
                }}
              >
                {section.heading}
              </h3>
              <p className="text-body leading-relaxed mb-6">
                {section.lead}
              </p>

              {section.subsections.map((sub) => (
                <div key={sub.heading} className="mt-8">
                  <h4 className="text-base font-medium text-ink mb-3">
                    {sub.heading}
                  </h4>
                  <div className="space-y-3 text-body leading-relaxed">
                    {sub.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}

              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-6 space-y-2 list-disc pl-6 text-body leading-relaxed">
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
