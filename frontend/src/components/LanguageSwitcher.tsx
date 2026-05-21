"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import {
  stripLocalePrefix,
  useCurrentLocale,
  type SupportedLocale,
} from "@/i18n/useLocalizedHref";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const currentLocale = useCurrentLocale();

  const switchLocale = (newLocale: SupportedLocale) => {
    startTransition(() => {
      // Always preserve the current sub-path, only swap the locale prefix.
      // e.g. /zh/tools/word-to-pdf  --switch to en-->  /en/tools/word-to-pdf
      const subPath = stripLocalePrefix(pathname);
      const target = subPath === "/" ? `/${newLocale}` : `/${newLocale}${subPath}`;
      router.push(target);
    });
  };

  const nextLocale: SupportedLocale = currentLocale === "en" ? "zh" : "en";

  return (
    <button
      onClick={() => switchLocale(nextLocale)}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium text-body hover:text-ink transition-colors disabled:opacity-50"
      title={currentLocale === "en" ? "切换到中文" : "Switch to English"}
      aria-label={currentLocale === "en" ? "Switch to Chinese" : "Switch to English"}
    >
      <Globe className="w-4 h-4" />
      <span>{currentLocale === "en" ? "中文" : "EN"}</span>
    </button>
  );
}
