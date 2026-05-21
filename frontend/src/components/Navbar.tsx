"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ToolIcons, tools } from "./ToolConfig";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const documentTools = tools.filter(t => t.category === "document");
  const utilityTools = tools.filter(t => t.category === "utility");

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-hairline">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <a href="/" className="flex items-center gap-2 text-ink hover:text-ink no-underline hover:no-underline">
            <span className="spike-mark text-ink" />
            <span className="font-sans text-title-md font-medium">
              All-in-One
            </span>
          </a>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors"
              >
                <span>Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute top-full mt-2 left-0 w-80 bg-canvas border border-hairline rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-3">
                      <div className="px-3 py-1.5 caption-upper text-muted-soft">
                        Documents
                      </div>
                      {documentTools.map((tool) => {
                        const Icon = ToolIcons[tool.iconName];
                        return (
                          <a
                            key={tool.name}
                            href={tool.href}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-surface-card transition-colors text-ink hover:text-ink no-underline hover:no-underline"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-body-sm font-medium">{tool.name}</div>
                              <div className="text-xs text-muted mt-0.5">{tool.description}</div>
                            </div>
                          </a>
                        );
                      })}

                      <div className="px-3 py-1.5 mt-3 caption-upper text-muted-soft border-t border-hairline-soft pt-3">
                        Utilities
                      </div>
                      {utilityTools.map((tool) => {
                        const Icon = ToolIcons[tool.iconName];
                        return (
                          <a
                            key={tool.name}
                            href={tool.href}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-surface-card transition-colors text-ink hover:text-ink no-underline hover:no-underline"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-body-sm font-medium">{tool.name}</div>
                              <div className="text-xs text-muted mt-0.5">{tool.description}</div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <a href="/about" className="px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors no-underline">
              About
            </a>
            <a href="/docs" className="px-3 py-2 text-body-sm font-medium text-body hover:text-ink transition-colors no-underline">
              Docs
            </a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-body-sm font-medium text-body hover:text-ink transition-colors no-underline"
            >
              GitHub
            </a>
            <a
              href="/tools/word-to-pdf"
              className="px-5 py-2.5 bg-primary text-on-primary text-body-sm font-medium rounded-md hover:bg-primary-active transition-colors no-underline"
            >
              Try it
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}