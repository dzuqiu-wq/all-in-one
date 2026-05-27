"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useParams } from "next/navigation";
import {
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check,
  Share2,
  MessageCircle,
} from "lucide-react";

export interface BilingualText {
  en: string;
  zh: string;
}

export interface ShareButtonsProps {
  /** Bilingual share title — surfaced as the tweet body / Reddit submit title. */
  title: BilingualText;
  /** Optional bilingual eyebrow caption rendered to the left of the buttons. */
  eyebrow?: BilingualText;
  /** Optional hashtags appended to the X (Twitter) intent URL (no leading `#`). */
  hashtags?: string[];
  /** Wrapper class. */
  className?: string;
  /** Visual variant: "card" wraps in surface-card; "bare" omits the chrome. */
  variant?: "card" | "bare";
}

interface NetworkConfig {
  readonly id: "x" | "reddit" | "linkedin";
  readonly icon: typeof Twitter;
  readonly label: BilingualText;
}

const NETWORKS: readonly NetworkConfig[] = [
  {
    id: "x",
    icon: Twitter,
    label: { en: "Share on X (Twitter)", zh: "分享到 X" },
  },
  {
    id: "reddit",
    icon: MessageCircle,
    label: { en: "Share to Reddit", zh: "分享到 Reddit" },
  },
  {
    id: "linkedin",
    icon: Linkedin,
    label: { en: "Share on LinkedIn", zh: "分享到 LinkedIn" },
  },
] as const;

/**
 * Pure-frontend social share widget. Renders:
 *   • A native Web Share button when `navigator.share` is available (mobile).
 *   • X, Reddit, LinkedIn icon buttons that open the canonical web intent URL.
 *   • A "Copy link" button with a 2-second toast confirmation.
 *
 * SSR safety:
 *   The component first paints with a deterministic `BASE_URL + pathname`
 *   URL so the SSG output is stable and hydration-mismatch-free. After
 *   mount it upgrades to `window.location.href`, which respects any
 *   client-side routing parameters or canonical overrides.
 */
export default function ShareButtons({
  title,
  eyebrow,
  hashtags = [],
  className = "",
  variant = "card",
}: ShareButtonsProps) {
  const pathname = usePathname() ?? "/";
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "zh" ? "zh" : "en";
  const isZh = locale === "zh";

  const [absUrl, setAbsUrl] = useState<string>(() => `BASE_URL${pathname}`);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Hydration upgrade: pick up the actual document URL plus feature-detect
  // navigator.share. Both are gated behind `typeof window !== "undefined"`
  // so the same module can be imported into a Server Component without
  // tripping a build-time reference error.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setAbsUrl(window.location.href);
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      setCanNativeShare(true);
    }
  }, [pathname]);

  const shareTitle = isZh ? title.zh : title.en;
  const eyebrowText = useMemo<string>(() => {
    if (eyebrow) return isZh ? eyebrow.zh : eyebrow.en;
    return isZh ? "分享给同好者" : "Share this with a friend";
  }, [eyebrow, isZh]);

  const intents = useMemo(() => {
    const u = encodeURIComponent(absUrl);
    const t = encodeURIComponent(shareTitle);
    const tagSegment =
      hashtags.length > 0
        ? `&hashtags=${encodeURIComponent(hashtags.join(","))}`
        : "";
    return {
      x: `https://twitter.com/intent/tweet?url=${u}&text=${t}${tagSegment}`,
      reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    } as const;
  }, [absUrl, shareTitle, hashtags]);

  const handleNativeShare = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") return;
    if (typeof navigator === "undefined" || typeof navigator.share !== "function")
      return;
    try {
      await navigator.share({ title: shareTitle, text: shareTitle, url: absUrl });
    } catch {
      // User dismissed the sheet or the share target rejected — stay silent;
      // surfacing an error toast for "I cancelled" would be annoying.
    }
  }, [shareTitle, absUrl]);

  const handleCopy = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") return;
    const text = absUrl;
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        // Legacy fallback for browsers without the async Clipboard API.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard failures generally cannot be recovered from
      // and the URL is also visible in the address bar.
    }
  }, [absUrl]);

  const copyLabel = isZh ? "复制链接" : "Copy link";
  const copiedLabel = isZh ? "链接已复制 / Link copied!" : "Link copied!";
  const nativeLabel = isZh ? "系统分享" : "Share via device";

  const wrapperClass =
    variant === "card"
      ? `surface-card hairline rounded-xl p-md ${className}`
      : className;

  return (
    <div className={wrapperClass} aria-label={isZh ? "社交分享" : "Social share"}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="caption-upper text-muted-soft text-xs whitespace-nowrap">
          {eyebrowText}
        </span>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Native share — only paints after hydration when supported. */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              aria-label={nativeLabel}
              className="inline-flex items-center gap-2 px-3 py-2 text-body-sm font-medium rounded-md bg-primary text-on-primary hover:bg-primary-active transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.75} />
              <span>{nativeLabel}</span>
            </button>
          )}

          {/* X / Reddit / LinkedIn web intents. */}
          {NETWORKS.map((n) => {
            const Icon = n.icon;
            const aria = isZh ? n.label.zh : n.label.en;
            return (
              <a
                key={n.id}
                href={intents[n.id]}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={aria}
                title={aria}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-canvas border border-hairline text-body hover:text-primary hover:border-primary hover:bg-surface-cream-strong transition-all duration-200 hover:scale-105 no-underline focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </a>
            );
          })}

          {/* Copy-to-clipboard button with smooth 2s toast confirmation. */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? copiedLabel : copyLabel}
            title={copied ? copiedLabel : copyLabel}
            className={`inline-flex items-center gap-2 px-3 py-2 text-body-sm font-medium rounded-md border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              copied
                ? "bg-success/10 text-success border-success/30"
                : "bg-canvas border-hairline text-body hover:text-primary hover:border-primary hover:bg-surface-cream-strong"
            }`}
          >
            <span
              className={`inline-flex items-center gap-2 transition-opacity duration-300 ease-out ${
                copied ? "opacity-100" : "opacity-100"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={1.75} />
                  <span>{copiedLabel}</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" strokeWidth={1.75} />
                  <span>{copyLabel}</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
