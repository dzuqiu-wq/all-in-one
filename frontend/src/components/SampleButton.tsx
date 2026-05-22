"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Check } from "lucide-react";

export interface SampleButtonProps {
  /** Callback invoked when the user clicks the button. */
  onLoad: () => void | Promise<void>;
  /** Optional override label rendered next to the icon. */
  label?: string;
  /** Optional helper text under the button. */
  helper?: string;
  /** Whether the button is disabled (e.g., during the parent's processing). */
  disabled?: boolean;
  /** Optional layout: "block" stretches full width; "inline" hugs content. */
  layout?: "block" | "inline";
  className?: string;
}

/**
 * "Try with Sample File" button. Renders a coral-highlighted CTA that
 * sits beneath the dropzone in each tool's empty state. The actual
 * sample payload is provided by the parent — this component is
 * intentionally presentational.
 *
 * On click, the button shows a brief "Sample loaded" confirmation for
 * 1.5 seconds before resetting, providing the user with feedback that
 * the action took effect even when the surrounding UI updates instantly.
 */
export default function SampleButton({
  onLoad,
  label,
  helper,
  disabled,
  layout = "block",
  className = "",
}: SampleButtonProps) {
  const t = useTranslations();
  const [loaded, setLoaded] = useState(false);

  const handleClick = async () => {
    if (disabled || loaded) return;
    try {
      await onLoad();
      setLoaded(true);
      setTimeout(() => setLoaded(false), 1500);
    } catch {
      // Surface failure silently to the parent; we do not want a sample
      // load error to spam the user — the parent should already show
      // an inline error if the underlying handler throws.
    }
  };

  const buttonText = loaded ? t("sample.loaded") : (label ?? t("sample.button"));
  const helperText = helper ?? t("sample.helper");

  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2.5 text-body-sm font-medium rounded-md transition-all duration-150 border";

  const stateClasses = loaded
    ? "bg-success/10 text-success border-success/30"
    : "bg-surface-cream-strong text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50";

  return (
    <div
      className={`${layout === "block" ? "w-full" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loaded}
        className={`${baseClasses} ${stateClasses} ${layout === "block" ? "w-full justify-center" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-label={buttonText}
      >
        {loaded ? (
          <Check className="w-4 h-4" strokeWidth={2} />
        ) : (
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
        )}
        <span>{buttonText}</span>
      </button>
      {helperText && (
        <p className="mt-2 text-xs text-muted text-center leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  );
}
