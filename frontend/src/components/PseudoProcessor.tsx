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

const LOG_MESSAGES = [
  "[init] Reading buffer...",
  "[module] Allocating memory matrix...",
  "[process] Stream verification active...",
  "[ad] Optimizing viewport...",
  "[crypto] Verifying integrity...",
  "[memory] Defragmenting heap...",
  "[i/o] Mapping block device...",
  "[ok] Buffer complete",
  "[ok] Matrix allocation success",
  "[ok] Stream scan complete",
  "[sys] Initializing pipeline...",
];

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

  const generateTimestamp = useCallback((): string => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }, []);

  const addLog = useCallback((type: LogEntry["type"], text: string) => {
    const newLog: LogEntry = {
      id: Date.now() + Math.random(),
      text,
      timestamp: generateTimestamp(),
      type,
    };
    setLogs((prev) => [...prev.slice(-15), newLog]);
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

    const textCycleInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 800);

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < 12) {
        const types: LogEntry["type"][] = ["info", "system", "success", "info", "system", "success", "info"];
        addLog(types[logIndex % types.length], LOG_MESSAGES[logIndex % LOG_MESSAGES.length]);
        logIndex++;
      }
    }, 200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + Math.random() * 8 + 4, 100);
      });
    }, 250);

    const completeTimer = setTimeout(() => {
      clearInterval(textCycleInterval);
      clearInterval(logInterval);
      clearInterval(progressInterval);
      addLog("success", "[done] Processing complete");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-canvas rounded-xl max-w-2xl w-full overflow-hidden border border-hairline shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-title-md font-serif text-ink">
              {loadingTexts[currentTextIndex]}
            </span>
          </div>
          <span className="text-xs font-mono text-muted-soft">
            {Math.min(Math.floor(progress), 100)}%
          </span>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="h-1 bg-surface-card rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Terminal Body */}
        <div className="surface-dark mx-6 my-6 rounded-lg p-5 h-60 overflow-hidden">
          <div className="space-y-1.5 font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-3 ${
                  log.type === "success"
                    ? "text-success"
                    : log.type === "warning"
                    ? "text-warning"
                    : log.type === "system"
                    ? "text-accent-teal"
                    : "text-on-dark-soft"
                }`}
              >
                <span className="text-on-dark-soft opacity-60">[{log.timestamp}]</span>
                <span>{log.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-primary">›</span>
              <span className="inline-block w-2 h-3 bg-on-dark animate-pulse" />
            </div>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="px-6 pb-6">
          <AdBanner slot={adSlot} format="auto" />
        </div>
      </div>
    </div>
  );
}