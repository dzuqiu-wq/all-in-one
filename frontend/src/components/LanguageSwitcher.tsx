'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

type Locale = 'en' | 'zh';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale: Locale = pathname.startsWith('/zh') ? 'zh' : 'en';

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      let newPathname = pathname;
      if (newPathname.startsWith('/en')) {
        newPathname = newPathname.replace(/^\/en/, '') || '/';
      } else if (newPathname.startsWith('/zh')) {
        newPathname = newPathname.replace(/^\/zh/, '') || '/';
      }

      if (newLocale === 'en') {
        router.push(newPathname);
      } else {
        router.push(`/${newLocale}${newPathname === '/' ? '' : newPathname}`);
      }
    });
  };

  return (
    <button
      onClick={() => switchLocale(currentLocale === 'en' ? 'zh' : 'en')}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-body hover:text-ink transition-colors disabled:opacity-50"
      title={currentLocale === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <Globe className="w-4 h-4" />
      <span>{currentLocale === 'en' ? '中文' : 'EN'}</span>
    </button>
  );
}