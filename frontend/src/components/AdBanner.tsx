"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
}

// Replace with your actual Google AdSense Publisher ID
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-0000000000000000";

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize AdSense (if available)
    const initAd = async () => {
      try {
        // @ts-expect-error - AdSense global
        if (typeof adsbygoogle !== "undefined") {
          // @ts-expect-error - AdSense global
          (adsbygoogle = (window as any).adsbygoogle || []).push({});
          setIsLoaded(true);
        }
      } catch {
        // AdSense not available
      }
    };

    initAd();

    // AdBlock detection: check if container is blocked
    const checkBlocked = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // If height is 0 after a delay, ad is likely blocked
        if (rect.height === 0 && !isLoaded) {
          setIsBlocked(true);
        }
      }
    };

    // Check after a short delay
    const timer = setTimeout(checkBlocked, 2000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (isBlocked) {
    return (
      <div
        ref={containerRef}
        className={`
          flex items-center justify-center
          min-h-[90px] max-h-[120px]
          border border-dashed border-[var(--border-default)]
          bg-[var(--bg-card)]/50
          ${className}
        `}
      >
        <div className="text-center px-4">
          <span className="text-[var(--text-muted)] text-xs font-mono tracking-wider">
            [SYSTEM_NOTICE]:
          </span>
          <p className="text-[var(--text-secondary)] text-xs mt-1 font-mono">
            Ads offset server costs. Consider whitelisting us to support 0-cost tools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}