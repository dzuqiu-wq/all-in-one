"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-0000000000000000";

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initAd = async () => {
      try {
        // @ts-expect-error - AdSense global
        if (typeof adsbygoogle !== "undefined") {
          // @ts-expect-error - AdSense global
          (adsbygoogle = (window as any).adsbygoogle || []).push({});
          setIsLoaded(true);
        }
      } catch {
        // ignore
      }
    };

    initAd();

    const checkBlocked = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.height === 0 && !isLoaded) {
          setIsBlocked(true);
        }
      }
    };

    const timer = setTimeout(checkBlocked, 2000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (isBlocked) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center min-h-[90px] max-h-[120px] border border-dashed border-hairline rounded-md bg-surface-soft ${className}`}
      >
        <div className="text-center px-4">
          <span className="caption-upper text-muted-soft">
            Notice
          </span>
          <p className="text-body-sm text-muted mt-1">
            Ads help offset hosting costs. Consider whitelisting us to support free tools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
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