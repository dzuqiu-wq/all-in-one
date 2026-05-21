"use client";

import Link from "next/link";
import { useLocalizedHref } from "@/i18n/useLocalizedHref";

interface FooterProps {
  version?: string;
}

interface FooterLinkProps {
  path: string;
  label: string;
}

function FooterLink({ path, label }: FooterLinkProps) {
  const href = useLocalizedHref(path);
  return (
    <Link
      href={href}
      className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline"
    >
      {label}
    </Link>
  );
}

export default function Footer({ version = "0.1.0" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="surface-dark mt-section">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="spike-mark text-on-dark" />
              <span className="font-sans text-title-md font-medium text-on-dark">
                All-in-One
              </span>
            </div>
            <p className="text-body-sm text-on-dark-soft leading-relaxed">
              Thoughtful tools for documents, images, and everyday productivity.
            </p>
            <div className="mt-6 text-xs font-mono text-on-dark-soft">v{version}</div>
          </div>

          {/* Product */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">Product</h4>
            <nav className="flex flex-col gap-3">
              <FooterLink path="/tools/word-to-pdf" label="Word → PDF" />
              <FooterLink path="/tools/pdf-merge-split" label="PDF Tools" />
              <FooterLink path="/tools/image-optimizer" label="Image Optimizer" />
              <FooterLink path="/tools/qrcode-generator" label="QR Generator" />
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">Resources</h4>
            <nav className="flex flex-col gap-3">
              <FooterLink path="/docs" label="Documentation" />
              <FooterLink path="/changelog" label="Changelog" />
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline"
              >
                GitHub
              </a>
              <FooterLink path="/api" label="API" />
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">Legal</h4>
            <nav className="flex flex-col gap-3">
              <FooterLink path="/privacy" label="Privacy Policy" />
              <FooterLink path="/terms" label="Terms of Service" />
              <FooterLink path="/cookies" label="Cookie Policy" />
              <FooterLink path="/about" label="About" />
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-on-dark-soft/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-body-sm text-on-dark-soft">
            © {currentYear} All-in-One Toolbox. Open source under MIT License.
          </p>
          <p className="text-xs text-on-dark-soft">
            Ads help offset hosting costs. Thank you for your support.
          </p>
        </div>
      </div>
    </footer>
  );
}
