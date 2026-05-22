"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterProps {
  version?: string;
}

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
    wordPdf: {
      en: 'Word → PDF',
      zh: 'Word ↔ PDF 转换'
    },
    pdfTools: {
      en: 'PDF Tools',
      zh: 'PDF 工具箱'
    },
    imageOptimizer: {
      en: 'Image Optimizer',
      zh: '图片无损压缩'
    },
    qrGenerator: {
      en: 'QR Generator',
      zh: '矩阵二维码生成'
    }
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
    api: {
      en: 'API',
      zh: 'API 接口'
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
    }
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

export default function Footer({ version = "0.1.0" }: FooterProps) {
  const pathname = usePathname() || "/";
  const currentYear = new Date().getFullYear();
  
  // Detect current locale from pathname
  const locale = pathname.startsWith('/zh') ? 'zh' : 'en';

  return (
    <footer className="surface-dark mt-section">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="spike-mark text-on-dark" />
              <span className="font-sans text-title-md font-medium text-on-dark">
                All-in-One
              </span>
            </div>
            <p className="text-body-sm text-on-dark-soft leading-relaxed">
              {t(translations.brand.slogan, locale)}
            </p>
            <div className="mt-6 text-xs font-mono text-on-dark-soft">v{version}</div>
          </div>

          {/* Product */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              {t(translations.product.title, locale)}
            </h4>
            <nav className="flex flex-col gap-3">
              <FooterLink 
                path="/tools/word-to-pdf" 
                label={t(translations.product.wordPdf, locale)} 
                locale={locale} 
              />
              <FooterLink 
                path="/tools/pdf-merge-split" 
                label={t(translations.product.pdfTools, locale)} 
                locale={locale} 
              />
              <FooterLink 
                path="/tools/image-optimizer" 
                label={t(translations.product.imageOptimizer, locale)} 
                locale={locale} 
              />
              <FooterLink 
                path="/tools/qrcode-generator" 
                label={t(translations.product.qrGenerator, locale)} 
                locale={locale} 
              />
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
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline"
              >
                {translations.resources.github}
              </a>
              <FooterLink 
                path="/api" 
                label={t(translations.resources.api, locale)} 
                locale={locale} 
              />
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