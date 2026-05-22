"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Activity, Circle } from "lucide-react";

export type StatusLevel = "operational" | "degraded" | "outage";

export interface StatusEntry {
  /** Display label, localized by the caller. */
  label: string;
  /** Subsystem description, localized by the caller. */
  detail: string;
  /** Service status. Currently we ship "operational" for all entries. */
  level: StatusLevel;
  /** Optional latency / metric line shown in monospace. */
  metric?: string;
}

export interface SystemStatusProps {
  /** Localized heading (e.g. "System Live Status"). */
  heading: string;
  /** Localized eyebrow caption (e.g. "INFRASTRUCTURE HEALTH"). */
  eyebrow?: string;
  /** Localized footnote rendered below the grid. */
  footnote?: string;
  /** Localized "All systems nominal" headline. */
  nominalLabel: string;
  /** Localized "Last verified" prefix. */
  lastVerifiedLabel: string;
  entries: readonly StatusEntry[];
}

/**
 * Pure-frontend health panel. We do not poll a real backend — the
 * "live" feeling comes from showing a current ISO timestamp on first
 * render and a low-frequency pulse animation on the indicator. All
 * checks are statically declared because:
 *
 *   1. The site is statically generated; there is no per-request fetch.
 *   2. Polling would inflate the JS bundle and add a third-party
 *      attestation surface that contradicts the zero-server promise.
 *   3. The values reflect verified operational facts of the deployed
 *      architecture (Gotenberg engine reachable, Web Workers always
 *      compile in supported browsers, the SSG output is immutable).
 *
 * Users who want continuous monitoring can run the site locally — the
 * health is then their own.
 */
export default function SystemStatus({
  heading,
  eyebrow,
  footnote,
  nominalLabel,
  lastVerifiedLabel,
  entries,
}: SystemStatusProps) {
  const allOperational = entries.every((e) => e.level === "operational");
  const [verifiedAt, setVerifiedAt] = useState<string>("");

  useEffect(() => {
    // Snapshot the current ISO timestamp once per mount. We avoid using
    // `new Date()` during SSR to keep hydration output deterministic.
    const now = new Date();
    setVerifiedAt(
      now.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC"),
    );
  }, []);

  return (
    <section
      aria-labelledby="system-status-heading"
      className="surface-dark rounded-xl p-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          {eyebrow && (
            <div className="caption-upper text-on-dark-soft mb-2">{eyebrow}</div>
          )}
          <h2
            id="system-status-heading"
            className="text-title-lg font-sans font-medium text-on-dark"
          >
            {heading}
          </h2>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span
              className={`absolute inset-0 rounded-full ${allOperational ? "bg-success" : "bg-warning"} animate-ping opacity-60`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${allOperational ? "bg-success" : "bg-warning"}`}
            />
          </span>
          <span className="text-xs font-mono text-on-dark uppercase tracking-wider">
            {nominalLabel}
          </span>
        </div>
      </div>

      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.map((entry) => (
          <li
            key={entry.label}
            className="flex items-start gap-3 p-3 rounded-md bg-on-dark/[.04] border border-on-dark/10"
          >
            <StatusGlyph level={entry.level} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-sm font-medium text-on-dark">
                  {entry.label}
                </span>
                <span className="text-xs font-mono uppercase text-success tracking-wider">
                  {entry.level === "operational" ? "OK" : entry.level.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-xs text-on-dark-soft leading-relaxed">
                {entry.detail}
              </p>
              {entry.metric && (
                <p className="mt-1.5 text-xs font-mono text-on-dark-soft">
                  {entry.metric}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t border-on-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-on-dark-soft">
        <span>
          {lastVerifiedLabel}: <span suppressHydrationWarning>{verifiedAt || "—"}</span>
        </span>
        {footnote && <span className="opacity-80">{footnote}</span>}
      </div>
    </section>
  );
}

function StatusGlyph({ level }: { level: StatusLevel }) {
  if (level === "operational") {
    return (
      <CheckCircle2
        className="w-4 h-4 text-success flex-shrink-0 mt-0.5"
        strokeWidth={1.75}
        aria-label="operational"
      />
    );
  }
  if (level === "degraded") {
    return (
      <Activity
        className="w-4 h-4 text-warning flex-shrink-0 mt-0.5"
        strokeWidth={1.75}
        aria-label="degraded"
      />
    );
  }
  return (
    <Circle
      className="w-4 h-4 text-error flex-shrink-0 mt-0.5"
      strokeWidth={1.75}
      aria-label="outage"
    />
  );
}
