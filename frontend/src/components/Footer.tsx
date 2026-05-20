"use client";

import AdBanner from "./AdBanner";

interface FooterProps {
  version?: string;
}

export default function Footer({ version = "0.1.0" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--bg-card)]/50">
      {/* Top Ad Banner */}
      <div className="mx-auto px-4 pt-4 pb-2">
        <AdBanner slot="footer-top" format="auto" className="w-full" />
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[var(--neon-green)]">AIO</span>
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">All-in-One Toolbox</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-xs">
              Open-source developer toolkit for document conversion, image optimization,
              and productivity automation. Zero cost, pure client-side processing.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">v{version}</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[10px] font-mono text-[var(--neon-green)]">BUILD:PRODUCTION</span>
            </div>
          </div>

          {/* Legal Links Grid */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
              Legal
            </h4>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-2">
              <a
                href="/privacy"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-green)] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-green)] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/about"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-green)] transition-colors"
              >
                About Us
              </a>
              <a
                href="/cookies"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-green)] transition-colors"
              >
                Cookie Policy
              </a>
            </nav>
          </div>

          {/* Resources Grid */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
              Resources
            </h4>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-2">
              <a
                href="/docs"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-blue)] transition-colors"
              >
                Documentation
              </a>
              <a
                href="/api"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-blue)] transition-colors"
              >
                API Reference
              </a>
              <a
                href="/github"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-blue)] transition-colors"
              >
                GitHub
              </a>
              <a
                href="/changelog"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--neon-blue)] transition-colors"
              >
                Changelog
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-mono text-[var(--text-muted)]">
            © {currentYear} All-in-One Toolbox. Open source under MIT License.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              MADE WITH <span className="text-[var(--neon-green)]">■</span> BY DEVELOPERS
            </span>
          </div>
        </div>
      </div>

      {/* AdSense Disclosure */}
      <div className="mx-auto px-4 pb-4">
        <p className="text-[10px] font-mono text-[var(--text-muted)] text-center">
          [ADS] Third-party ads help offset server costs. We are a participant in the Google AdSense program.
          <a href="/ads" className="text-[var(--text-link)] ml-1 hover:underline">Learn more</a>
        </p>
      </div>
    </footer>
  );
}