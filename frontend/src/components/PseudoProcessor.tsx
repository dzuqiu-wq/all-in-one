"use client";

import { useState, useEffect, useCallback } from "react";
import AdBanner from "@/components/AdBanner";

interface PseudoProcessorProps {
  isProcessing: boolean;
  onComplete: () => void;
  loadingTexts: string[];
  adSlot?: string;
}

interface LogEntry {
  id: number;
  text: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "system";
}

const LOG_MESSAGES = {
  info: [
    "[SYSTEM]: Reading Buffer...",
    "[MODULE]: Allocation Matrix...",
    "[AD_DECK]: Optimizing Viewport...",
    "[PROCESS]: Scanning File Stream...",
    "[CRYPTO]: Verifying Integrity...",
    "[MEMORY]: Defragmenting Heap...",
    "[I/O]: Mapping Block Device...",
  ],
  success: [
    "[OK] Buffer Read Complete",
    "[OK] Matrix Allocation Success",
    "[OK] Viewport Optimization Done",
    "[OK] Stream Scan Complete",
  ],
  system: [
    "[SYS] Loading compression module...",
    "[SYS] Initializing quantum engine...",
    "[SYS] Warming up neural network...",
  ],
  warning: [
    "[WARN] High memory threshold detected",
    "[WARN] Parallel thread limit reached",
  ],
};

export default function PseudoProcessor({
  isProcessing,
  onComplete,
  loadingTexts,
  adSlot = "processing-mid",
}: PseudoProcessorProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [adRefreshTrigger, setAdRefreshTrigger] = useState(0);

  const generateTimestamp = useCallback((): string => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
  }, []);

  const addLog = useCallback((type: LogEntry["type"], text: string) => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      text,
      timestamp: generateTimestamp(),
      type,
    };
    setLogs((prev) => [...prev.slice(-20), newLog]); // Keep last 20 logs
  }, [generateTimestamp]);

  useEffect(() => {
    if (!isProcessing) {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    setLogs([]);
    setProgress(0);
    setCurrentTextIndex(0);

    // Cycle through loading texts
    const textCycleInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 800);

    // Simulate log output
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < 12) {
        const types: LogEntry["type"][] = ["info", "system", "info", "success", "info", "warning", "info", "system", "info", "success", "info", "system"];
        const allLogs = [
          ...LOG_MESSAGES.info,
          ...LOG_MESSAGES.system,
          ...LOG_MESSAGES.success,
        ];
        addLog(types[logIndex % types.length], allLogs[logIndex % allLogs.length]);
        logIndex++;
      }
    }, 200);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Trigger ad refresh at 30% and 60%
        if ((prev < 30 && prev + 8 >= 30) || (prev < 60 && prev + 8 >= 60)) {
          setAdRefreshTrigger((p) => p + 1);
        }
        return Math.min(prev + (Math.random() * 8 + 4));
      });
    }, 250);

    // Completion timer
    const completeTimer = setTimeout(() => {
      clearInterval(textCycleInterval);
      clearInterval(logInterval);
      clearInterval(progressInterval);
      addLog("success", "[DONE] Processing Complete. Output Ready.");
      setTimeout(onComplete, 500);
    }, 2500);

    return () => {
      clearTimeout(completeTimer);
      clearInterval(textCycleInterval);
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [isProcessing, loadingTexts, onComplete, addLog]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      {/* Matrix Scan Animation Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[var(--neon-green)] to-transparent animate-pulse"
            style={{
              top: `${i * 5}%`,
              left: 0,
              right: 0,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "2s",
            }}
          />
        ))}
      </div>

      {/* Ad Banner - Forces visual focus */}
      <div className="absolute top-8 mx-auto max-w-lg w-full px-4">
        <AdBanner key={`ad-${adRefreshTrigger}`} slot={adSlot} format="auto" />
      </div>

      {/* Central Processing Unit */}
      <div className="relative w-full max-w-2xl mx-auto px-4">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] ml-2">
              system_processor.exe
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--neon-green)]">
            PID: {Math.floor(Math.random() * 9000) + 1000}
          </span>
        </div>

        {/* Terminal Body */}
        <div className="bg-[var(--bg-secondary)] border-x border-b border-[var(--border-default)] rounded-b-lg p-4 h-80 overflow-hidden">
          {/* Current Operation */}
          <div className="mb-4 pb-3 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2 text-[var(--neon-green)]">
              <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
              <span className="text-sm font-mono animate-pulse">
                {loadingTexts[currentTextIndex]}
              </span>
            </div>
          </div>

          {/* Log Output */}
          <div className="space-y-1 font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-3 opacity-0 animate-in fade-in slide-in-from-left-2 duration-200 ${
                  log.type === "success"
                    ? "text-[var(--neon-green)]"
                    : log.type === "warning"
                    ? "text-[var(--warning)]"
                    : log.type === "system"
                    ? "text-[var(--neon-blue)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <span className="text-[var(--text-muted)]">[{log.timestamp}]</span>
                <span>{log.text}</span>
              </div>
            ))}
            {/* Cursor blink */}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[var(--neon-green)]">›</span>
              <span className="w-2 h-4 bg-[var(--neon-green)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Processing Progress
            </span>
            <span className="text-xs font-mono text-[var(--neon-green)]">
              {Math.min(Math.floor(progress), 100)}%
            </span>
          </div>
          <div className="h-1 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-default)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Matrix Decoration */}
        <div className="mt-6 flex items-center justify-center gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="text-[var(--neon-green)] font-mono text-xs opacity-50"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {["0x00", "0xFF", "SYS", "OK", ">>", "##", "[+]", "<<<"][i]}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Ad - Second ad impression */}
      <div className="absolute bottom-8 mx-auto max-w-lg w-full px-4">
        <AdBanner key={`ad-bottom-${adRefreshTrigger}`} slot="processing-bottom" format="rectangle" className="mx-auto max-w-[336px]" />
      </div>
    </div>
  );
}