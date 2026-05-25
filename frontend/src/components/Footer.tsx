"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { CONTACT, SOCIAL } from "@/lib/constants";
import { TOOLS } from "@/lib/toolRegistry";

interface FooterLinkProps {
  path: string;
  label: string;
  locale: string;
}

function FooterLink({ path, label, locale }: FooterLinkProps) {
  // Add locale prefix to path
  const href = path.startsWith('/') ? `/${locale}${path}` : path;
  return (
    <Link
      href={href}
      className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline"
    >
      {label}
    </Link>
  );
}

// Dictionary mapping for Chinese translations
const translations = {
  product: {
    title: {
      en: 'Product',
      zh: '产品工具'
    },
  },
  resources: {
    title: {
      en: 'Resources',
      zh: '开源资源'
    },
    documentation: {
      en: 'Documentation',
      zh: '开发文档'
    },
    changelog: {
      en: 'Changelog',
      zh: '更新日志'
    },
    github: 'GitHub'
  },
  legal: {
    title: {
      en: 'Legal',
      zh: '法律与合规'
    },
    privacyPolicy: {
      en: 'Privacy Policy',
      zh: '隐私政策'
    },
    termsOfService: {
      en: 'Terms of Service',
      zh: '服务条款'
    },
    cookiePolicy: {
      en: 'Cookie Policy',
      zh: 'Cookie 政策'
    },
    about: {
      en: 'About',
      zh: '关于我们'
    }
  },
  brand: {
    slogan: {
      en: 'Thoughtful tools for documents, images, and everyday productivity.',
      zh: '为您打造的文档、图片及日常效率提升的极客工具箱。'
    },
    contactLabel: {
      en: 'Contact us',
      zh: '联络我们',
    },
  },
  footer: {
    copyright: {
      en: 'Open source under MIT License.',
      zh: '基于 MIT 协议开源。'
    },
    ads: {
      en: 'Ads help offset hosting costs. Thank you for your support.',
      zh: '广告收益用于抵消服务器托管成本。感谢您的支持。'
    }
  }
};

// Helper function to get translation
function t(dict: { en: string; zh: string } | string, locale: string): string {
  if (typeof dict === 'string') return dict;
  return locale === 'zh' ? dict.zh : dict.en;
}

export default function Footer() {
  const pathname = usePathname() || "/";
  const currentYear = new Date().getFullYear();

  // Detect current locale from pathname
  const locale = pathname.startsWith('/zh') ? 'zh' : 'en';

  const tr = useTranslations();
  // Visual cap: 12 to keep the column compact. Beyond that, users find
  // tools via the navbar dropdown (canonical surface) or homepage matrix.
  const visibleTools = TOOLS.slice(0, 12);

  return (
    <footer className="surface-dark mt-section">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="spike-mark text-on-dark" />
              <span className="font-sans text-title-md font-medium text-on-dark">
                All-in-One
              </span>
            </div>
            <p className="text-body-sm text-on-dark-soft leading-relaxed">
              {t(translations.brand.slogan, locale)}
            </p>
            <a
              href={`mailto:${CONTACT.general}`}
              className="mt-5 inline-flex items-center gap-2 text-body-sm text-on-dark hover:text-primary transition-colors no-underline font-mono w-fit"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
              {CONTACT.general}
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              {t(translations.product.title, locale)}
            </h4>
            <nav className="flex flex-col gap-3">
              {visibleTools.map((tool) => (
                <FooterLink
                  key={tool.slug}
                  path={tool.href}
                  label={tr(`${tool.navKey}.name`)}
                  locale={locale}
                />
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              {t(translations.resources.title, locale)}
            </h4>
            <nav className="flex flex-col gap-3">
              <FooterLink
                path="/docs"
                label={t(translations.resources.documentation, locale)}
                locale={locale}
              />
              <FooterLink
                path="/changelog"
                label={t(translations.resources.changelog, locale)}
                locale={locale}
              />
              <a
                href={SOCIAL.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline"
              >
                {translations.resources.github}
              </a>
              <a
                href={`mailto:${CONTACT.general}`}
                className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline"
              >
                {t(translations.brand.contactLabel, locale)}
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              {t(translations.legal.title, locale)}
            </h4>
            <nav className="flex flex-col gap-3">
              <FooterLink 
                path="/privacy" 
                label={t(translations.legal.privacyPolicy, locale)} 
                locale={locale} 
              />
              <FooterLink 
                path="/terms" 
                label={t(translations.legal.termsOfService, locale)} 
                locale={locale} 
              />
              <FooterLink
                path="/cookie"
                label={t(translations.legal.cookiePolicy, locale)}
                locale={locale}
              />
              <FooterLink 
                path="/about" 
                label={t(translations.legal.about, locale)} 
                locale={locale} 
              />
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-on-dark-soft/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-body-sm text-on-dark-soft">
            © {currentYear} All-in-One Toolbox. {t(translations.footer.copyright, locale)}
          </p>
          <p className="text-xs text-on-dark-soft">
            {t(translations.footer.ads, locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}