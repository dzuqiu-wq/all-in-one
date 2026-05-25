/**
 * Canonical tool registry — the single source of truth for the eight tools
 * in the matrix. Used by:
 *   - HomeContent (industrial category grid)
 *   - Breadcrumb (label & href resolution)
 *   - RelatedTools sidebar (cross-tool linking)
 *   - Navbar / Footer (navigation)
 *
 * Adding a new tool? Append an entry here, then create the route + article.
 */

import type { ComponentType } from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  QrCode,
  Merge,
  Stamp,
  Receipt,
  Wrench,
  Sparkles,
  ShieldCheck,
  Coins,
  Image as PixelIcon,
  MessageCircle,
  Code,
  Braces,
  FileCode2,
  Hash,
  Crop,
  Key,
  Palette,
  Fingerprint,
} from "lucide-react";

export type ToolSlug =
  | "word-to-pdf"
  | "excel-to-pdf"
  | "powerpoint-to-pdf"
  | "pdf-merge-split"
  | "pdf-watermark"
  | "invoice-generator"
  | "image-optimizer"
  | "qrcode-generator"
  | "data-sanitizer"
  | "wechat-generator"
  | "json-formatter"
  | "base64"
  | "hash-generator"
  | "image-converter"
  | "image-resizer"
  | "password-generator"
  | "color-converter"
  | "uuid-generator";

export type ToolCategory =
  | "digital-legal"
  | "crypto-financial"
  | "pixel-image"
  | "developer";

export interface ToolDescriptor {
  slug: ToolSlug;
  href: `/tools/${ToolSlug}`;
  /** i18n key prefix under tools.* — e.g. tools.wordPdf */
  intlKey: string;
  /** i18n key prefix under nav.* — e.g. nav.wordPdf */
  navKey: string;
  category: ToolCategory;
  /** Whether processing executes purely in the browser (client) or via FastAPI/Gotenberg (server). */
  runtime: "client" | "server";
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Schema.org applicationCategory hint used by JSON-LD on the tool page. */
  schemaCategory:
    | "BusinessApplication"
    | "DesignApplication"
    | "MultimediaApplication"
    | "UtilitiesApplication"
    | "ProductivityApplication";
}

export interface CategoryDescriptor {
  id: ToolCategory;
  /** i18n key under home.categories.* */
  intlKey: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Accent color token used in the category badge. */
  accent: "primary" | "ink" | "muted";
}

export const CATEGORIES: readonly CategoryDescriptor[] = [
  {
    id: "digital-legal",
    intlKey: "home.categories.digitalLegal",
    icon: ShieldCheck,
    accent: "primary",
  },
  {
    id: "crypto-financial",
    intlKey: "home.categories.cryptoFinancial",
    icon: Coins,
    accent: "ink",
  },
  {
    id: "pixel-image",
    intlKey: "home.categories.pixelImage",
    icon: PixelIcon,
    accent: "muted",
  },
  {
    id: "developer",
    intlKey: "home.categories.developer",
    icon: Code,
    accent: "ink",
  },
] as const;

export const TOOLS: readonly ToolDescriptor[] = [
  {
    slug: "word-to-pdf",
    href: "/tools/word-to-pdf",
    intlKey: "tools.wordPdf",
    navKey: "nav.wordPdf",
    category: "digital-legal",
    runtime: "server",
    icon: FileText,
    schemaCategory: "BusinessApplication",
  },
  {
    slug: "excel-to-pdf",
    href: "/tools/excel-to-pdf",
    intlKey: "tools.excelPdf",
    navKey: "nav.excelPdf",
    category: "digital-legal",
    runtime: "server",
    icon: FileSpreadsheet,
    schemaCategory: "BusinessApplication",
  },
  {
    slug: "powerpoint-to-pdf",
    href: "/tools/powerpoint-to-pdf",
    intlKey: "tools.powerpointPdf",
    navKey: "nav.powerpointPdf",
    category: "digital-legal",
    runtime: "server",
    icon: Presentation,
    schemaCategory: "BusinessApplication",
  },
  {
    slug: "pdf-merge-split",
    href: "/tools/pdf-merge-split",
    intlKey: "tools.pdfMerge",
    navKey: "nav.pdfMerge",
    category: "digital-legal",
    runtime: "client",
    icon: Merge,
    schemaCategory: "BusinessApplication",
  },
  {
    slug: "pdf-watermark",
    href: "/tools/pdf-watermark",
    intlKey: "tools.pdfWatermark",
    navKey: "nav.pdfWatermark",
    category: "digital-legal",
    runtime: "client",
    icon: Stamp,
    schemaCategory: "BusinessApplication",
  },
  {
    slug: "invoice-generator",
    href: "/tools/invoice-generator",
    intlKey: "tools.invoiceGenerator",
    navKey: "nav.invoiceGenerator",
    category: "crypto-financial",
    runtime: "client",
    icon: Receipt,
    schemaCategory: "BusinessApplication",
  },
  {
    slug: "data-sanitizer",
    href: "/tools/data-sanitizer",
    intlKey: "tools.dataSanitizer",
    navKey: "nav.dataSanitizer",
    category: "crypto-financial",
    runtime: "client",
    icon: Wrench,
    schemaCategory: "ProductivityApplication",
  },
  {
    slug: "image-optimizer",
    href: "/tools/image-optimizer",
    intlKey: "tools.imageOptimizer",
    navKey: "nav.imageOptimizer",
    category: "pixel-image",
    runtime: "client",
    icon: ImageIcon,
    schemaCategory: "MultimediaApplication",
  },
  {
    slug: "qrcode-generator",
    href: "/tools/qrcode-generator",
    intlKey: "tools.qrcode",
    navKey: "nav.qrcode",
    category: "pixel-image",
    runtime: "client",
    icon: QrCode,
    schemaCategory: "DesignApplication",
  },
  {
    slug: "wechat-generator",
    href: "/tools/wechat-generator",
    intlKey: "tools.wechatGenerator",
    navKey: "nav.wechatGenerator",
    category: "pixel-image",
    runtime: "client",
    icon: MessageCircle,
    schemaCategory: "DesignApplication",
  },
  {
    slug: "json-formatter",
    href: "/tools/json-formatter",
    intlKey: "tools.jsonFormatter",
    navKey: "nav.jsonFormatter",
    category: "developer",
    runtime: "client",
    icon: Braces,
    schemaCategory: "UtilitiesApplication",
  },
  {
    slug: "base64",
    href: "/tools/base64",
    intlKey: "tools.base64",
    navKey: "nav.base64",
    category: "developer",
    runtime: "client",
    icon: FileCode2,
    schemaCategory: "UtilitiesApplication",
  },
  {
    slug: "hash-generator",
    href: "/tools/hash-generator",
    intlKey: "tools.hashGenerator",
    navKey: "nav.hashGenerator",
    category: "developer",
    runtime: "client",
    icon: Hash,
    schemaCategory: "UtilitiesApplication",
  },
  {
    slug: "image-converter",
    href: "/tools/image-converter",
    intlKey: "tools.imageConverter",
    navKey: "nav.imageConverter",
    category: "pixel-image",
    runtime: "client",
    icon: ImageIcon,
    schemaCategory: "MultimediaApplication",
  },
  {
    slug: "image-resizer",
    href: "/tools/image-resizer",
    intlKey: "tools.imageResizer",
    navKey: "nav.imageResizer",
    category: "pixel-image",
    runtime: "client",
    icon: Crop,
    schemaCategory: "MultimediaApplication",
  },
  {
    slug: "password-generator",
    href: "/tools/password-generator",
    intlKey: "tools.passwordGenerator",
    navKey: "nav.passwordGenerator",
    category: "developer",
    runtime: "client",
    icon: Key,
    schemaCategory: "UtilitiesApplication",
  },
  {
    slug: "color-converter",
    href: "/tools/color-converter",
    intlKey: "tools.colorConverter",
    navKey: "nav.colorConverter",
    category: "pixel-image",
    runtime: "client",
    icon: Palette,
    schemaCategory: "DesignApplication",
  },
  {
    slug: "uuid-generator",
    href: "/tools/uuid-generator",
    intlKey: "tools.uuidGenerator",
    navKey: "nav.uuidGenerator",
    category: "developer",
    runtime: "client",
    icon: Fingerprint,
    schemaCategory: "UtilitiesApplication",
  },
] as const;

export function getTool(slug: ToolSlug): ToolDescriptor {
  const found = TOOLS.find((t) => t.slug === slug);
  if (!found) throw new Error(`Unknown tool slug: ${slug}`);
  return found;
}

/**
 * Return up to `limit` related tools, preferring same-category siblings
 * first, then filling from other categories. Stable order based on the
 * registry definition so SSG output stays deterministic.
 */
export function getRelatedTools(
  current: ToolSlug,
  limit = 3,
): ToolDescriptor[] {
  const self = getTool(current);
  const siblings = TOOLS.filter(
    (t) => t.slug !== current && t.category === self.category,
  );
  const others = TOOLS.filter(
    (t) => t.slug !== current && t.category !== self.category,
  );
  return [...siblings, ...others].slice(0, limit);
}

export const CategoryIcon = {
  digitalLegal: ShieldCheck,
  cryptoFinancial: Coins,
  pixelImage: PixelIcon,
  developer: Code,
  spark: Sparkles,
};
