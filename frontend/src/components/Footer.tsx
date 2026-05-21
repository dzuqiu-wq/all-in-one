"use client";

interface FooterProps {
  version?: string;
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
            <div className="mt-6 text-xs font-mono text-on-dark-soft">
              v{version}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              Product
            </h4>
            <nav className="flex flex-col gap-3">
              <a href="/tools/word-to-pdf" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Word → PDF
              </a>
              <a href="/tools/pdf-merge-split" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                PDF Tools
              </a>
              <a href="/tools/image-optimizer" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Image Optimizer
              </a>
              <a href="/tools/qrcode-generator" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                QR Generator
              </a>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              Resources
            </h4>
            <nav className="flex flex-col gap-3">
              <a href="/docs" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Documentation
              </a>
              <a href="/changelog" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Changelog
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                GitHub
              </a>
              <a href="/api" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                API
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="caption-upper text-on-dark-soft mb-4 font-sans">
              Legal
            </h4>
            <nav className="flex flex-col gap-3">
              <a href="/privacy" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Privacy Policy
              </a>
              <a href="/terms" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Terms of Service
              </a>
              <a href="/cookies" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                Cookie Policy
              </a>
              <a href="/about" className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors no-underline">
                About
              </a>
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