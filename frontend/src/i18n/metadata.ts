import { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";

// Tool definitions for SEO metadata
export type ToolSlug = "word-to-pdf" | "pdf-merge-split" | "image-optimizer" | "qrcode-generator";

interface ToolMeta {
  title: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  keywords: {
    en: string[];
    zh: string[];
  };
}

// Tool metadata configuration
const toolMeta: Record<ToolSlug, ToolMeta> = {
  "word-to-pdf": {
    title: {
      en: "Word to PDF Converter | All-in-One Toolbox",
      zh: "Word 转 PDF 转换器 | All-in-One Toolbox",
    },
    description: {
      en: "Convert Word documents to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline, no disk storage. Fast 5-second timeout.",
      zh: "使用服务端 LibreOffice 处理将 Word 文档转换为 PDF。纯内存管道处理，文件绝不上传磁盘。5秒快速超时，100%隐私安全。",
    },
    keywords: {
      en: ["word to pdf", "docx to pdf", "document converter", "libreoffice", "pdf conversion", "online converter"],
      zh: ["Word转PDF", "DOCX转PDF", "文档转换器", "PDF转换", "在线转换工具", "LibreOffice"],
    },
  },
  "pdf-merge-split": {
    title: {
      en: "PDF Merge & Split Tool | All-in-One Toolbox",
      zh: "PDF 合并与拆分工具 | All-in-One Toolbox",
    },
    description: {
      en: "Merge multiple PDFs or extract specific pages from documents. Pure client-side processing in browser. No file upload, 100% privacy. Free and unlimited.",
      zh: "合并多个 PDF 或提取文档中的特定页面。纯浏览器端处理，无需上传文件。100%隐私保护，完全免费无限制使用。",
    },
    keywords: {
      en: ["pdf merge", "pdf split", "combine pdf", "extract pdf pages", "pdf tool", "browser pdf"],
      zh: ["PDF合并", "PDF拆分", "合并PDF", "提取页面", "PDF工具", "浏览器PDF"],
    },
  },
  "image-optimizer": {
    title: {
      en: "Image Optimizer & Compressor | All-in-One Toolbox",
      zh: "图片优化器与压缩器 | All-in-One Toolbox",
    },
    description: {
      en: "Compress images and convert to WebP format. Smart compression reduces file size by up to 80% while preserving quality. Pure browser processing, no upload.",
      zh: "压缩图片并转换为 WebP 格式。智能压缩可在保持质量的同时将文件大小减少 80%。纯浏览器处理，无需上传，隐私安全。",
    },
    keywords: {
      en: ["image optimizer", "compress image", "webp converter", "image compression", "reduce image size", "jpg to webp"],
      zh: ["图片压缩", "图片优化", "WebP转换", "JPG压缩", "PNG优化", "减少图片大小"],
    },
  },
  "qrcode-generator": {
    title: {
      en: "QR Code Generator | All-in-One Toolbox",
      zh: "二维码生成器 | All-in-One Toolbox",
    },
    description: {
      en: "Generate beautiful QR codes for URLs, text, and contact information. Customizable colors, sizes, and error correction levels. Pure client-side generation.",
      zh: "为网址、文本和联系人信息生成精美的二维码。可自定义颜色、尺寸和纠错级别。纯客户端生成，无需服务器处理。",
    },
    keywords: {
      en: ["qr code generator", "qr code maker", "create qr code", "custom qr code", "qr code design", "dynamic qr"],
      zh: ["二维码生成器", "QR码制作", "创建二维码", "自定义二维码", "二维码设计", "二维码工具"],
    },
  },
};

// Helper to generate alternates with hreflang
function generateAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: `${BASE_URL}${path}`,
    languages: {
      "en-US": `${BASE_URL}${path}`,
      "zh-CN": `${BASE_URL}/zh${path}`,
    },
  };
}

// Homepage metadata
export const homeMetadata: Metadata = {
  title: {
    default: "All-in-One Toolbox | Free Online Document & Image Tools",
    template: "%s | All-in-One Toolbox",
  },
  description:
    "A comprehensive collection of free online tools for document conversion, image optimization, and productivity. Privacy-first, browser-based processing.",
  keywords: [
    "online tools",
    "document converter",
    "image optimizer",
    "pdf tools",
    "qr code generator",
    "free tools",
    "productivity",
  ],
  alternates: generateAlternates("/"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "All-in-One Toolbox",
    title: "All-in-One Toolbox | Free Online Document & Image Tools",
    description:
      "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "All-in-One Toolbox | Free Online Document & Image Tools",
    description:
      "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
  },
};

// Tool page metadata generator. Returns a Next.js-compatible Metadata object
// for the requested tool, in the requested locale. (The Metadata type forbids
// per-locale maps on `title` / `description` / `keywords` — those expect plain
// strings — so locale switching happens here, not in the returned object.)
export function getToolMetadata(slug: ToolSlug, locale: "en" | "zh" = "en"): Metadata {
  const tool = toolMeta[slug];
  const paths = {
    en: `/tools/${slug}`,
    zh: `/zh/tools/${slug}`,
  };
  const isZh = locale === "zh";
  const title = isZh ? tool.title.zh : tool.title.en;
  const description = isZh ? tool.description.zh : tool.description.en;
  const keywords = isZh ? tool.keywords.zh : tool.keywords.en;
  const canonicalUrl = `${BASE_URL}${isZh ? paths.zh : paths.en}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-US": `${BASE_URL}${paths.en}`,
        "zh-CN": `${BASE_URL}${paths.zh}`,
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: canonicalUrl,
      siteName: "All-in-One Toolbox",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Export tool slugs for use in pages
export const toolSlugs: ToolSlug[] = ["word-to-pdf", "pdf-merge-split", "image-optimizer", "qrcode-generator"];