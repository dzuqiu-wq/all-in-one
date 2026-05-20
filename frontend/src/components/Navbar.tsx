"use client";

import { useState } from "react";
import { ChevronDown, Box, ExternalLink } from "lucide-react";
import { ToolIcons, tools } from "./ToolConfig";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [serverLatency] = useState("0.02ms");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
      <div className="mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-md bg-[var(--bg-card)] border border-[var(--neon-green)] flex items-center justify-center">
                <Box className="w-5 h-5 text-[var(--neon-green)]" />
              </div>
              <div className="absolute inset-0 rounded-md bg-[var(--neon-green)]/10 blur-md -z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                ALL-IN-ONE
              </span>
              <span className="text-[10px] font-mono text-[var(--neon-green)] tracking-widest">
                TOOLBOX
              </span>
            </div>
          </div>

          {/* Center: Tool Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-hover)] rounded-md transition-all duration-200"
            >
              <span>{t('common.tools')}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full mt-2 left-0 w-72 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    <div className="px-3 py-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                      Document Tools
                    </div>
                    {tools.filter(t =>
                      ["Word ↔ PDF", "PDF Merge/Split"].includes(t.name)
                    ).map((tool) => {
                      const Icon = ToolIcons[tool.iconName];
                      return (
                        <a
                          key={tool.name}
                          href={tool.href}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Icon className="w-4 h-4 text-[var(--neon-green)]" />
                          {tool.name}
                        </a>
                      );
                    })}

                    <div className="px-3 py-2 mt-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider border-t border-[var(--border-default)] pt-2">
                      Utility Tools
                    </div>
                    {tools.filter(t =>
                      ["Image Optimizer", "QR Code Generator"].includes(t.name)
                    ).map((tool) => {
                      const Icon = ToolIcons[tool.iconName];
                      return (
                        <a
                          key={tool.name}
                          href={tool.href}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Icon className="w-4 h-4 text-[var(--neon-blue)]" />
                          {tool.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Status Tag */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[var(--neon-green)]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--neon-green)] breathing-glow" />
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Server Status:
              </span>
              <span className="text-xs font-mono text-[var(--neon-green)] font-medium">
                NOMINAL ({serverLatency})
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}