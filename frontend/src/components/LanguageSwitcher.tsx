'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

type Locale = 'en' | 'zh';

/**
 * Extract locale from pathname
 */
function getLocaleFromPathname(pathname: string): Locale {
  if (pathname.startsWith('/zh')) return 'zh';
  return 'en';
}

/**
 * Get path without locale prefix
 * e.g., "/zh/tools/word-to-pdf" -> "/tools/word-to-pdf"
 * e.g., "/en/tools/word-to-pdf" -> "/tools/word-to-pdf"
 * e.g., "/zh" -> "/"
 * e.g., "/en" -> "/"
 */
function getPathWithoutLocale(pathname: string): string {
  if (pathname.startsWith('/zh')) {
    return pathname.replace(/^\/zh/, '') || '/';
  }
  if (pathname.startsWith('/en')) {
    return pathname.replace(/^\/en/, '') || '/';
  }
  return pathname;
}

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = getLocaleFromPathname(pathname);

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      // Get the path without locale prefix
      const pathWithoutLocale = getPathWithoutLocale(pathname);
      
      // Build new pathname with new locale
      let newPathname: string;
      if (newLocale === 'en') {
        // For English, go to root or path without /zh prefix
        newPathname = pathWithoutLocale === '/' ? '/en' : `/en${pathWithoutLocale}`;
      } else {
        // For Chinese, add /zh prefix
        newPathname = pathWithoutLocale === '/' ? '/zh' : `/zh${pathWithoutLocale}`;
      }
      
      router.push(newPathname);
    });
  };

  return (
    <button
      onClick={() => switchLocale(currentLocale === 'en' ? 'zh' : 'en')}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-body hover:text-ink transition-colors disabled:opacity-50"
      title={currentLocale === 'en' ? 'Switch to Chinese' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span>{currentLocale === 'en' ? '中文' : 'EN'}</span>
    </button>
  );
}