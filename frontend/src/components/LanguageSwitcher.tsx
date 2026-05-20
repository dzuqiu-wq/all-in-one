'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

type Locale = 'en' | 'zh';

const localeNames: Record<Locale, string> = {
  en: 'EN',
  zh: '中',
};

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith('/zh') ? 'zh' : 'en';

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      // Remove existing locale prefix
      let newPathname = pathname;
      if (newPathname.startsWith('/en')) {
        newPathname = newPathname.replace(/^\/en/, '') || '/';
      } else if (newPathname.startsWith('/zh')) {
        newPathname = newPathname.replace(/^\/zh/, '') || '/';
      }

      // Add new locale prefix
      if (newLocale === 'en') {
        router.push(newPathname);
      } else {
        router.push(`/${newLocale}${newPathname === '/' ? '' : newPathname}`);
      }
    });
  };

  return (
    <div className="relative flex items-center gap-1">
      <Globe className="w-4 h-4 text-[var(--text-muted)]" />
      <button
        onClick={() => switchLocale(currentLocale === 'en' ? 'zh' : 'en')}
        disabled={isPending}
        className="px-2 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--neon-green)] border border-[var(--border-default)] hover:border-[var(--neon-green)] rounded transition-all duration-200 disabled:opacity-50"
        title={currentLocale === 'en' ? 'Switch to Chinese' : '切换到英文'}
      >
        {localeNames[currentLocale === 'en' ? 'zh' : 'en']}
      </button>
    </div>
  );
}