import { Metadata } from "next";

// IMPORTANT: This file must be a server component (no "use client")

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Word to PDF Converter | All-in-One Toolbox",
    description: "Convert Word documents to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline, no disk storage.",
    keywords: ["word to pdf", "docx to pdf", "document converter", "libreoffice", "pdf conversion", "online converter"],
    alternates: {
      canonical: "https://333654.xyz/tools/word-to-pdf",
      languages: {
        "en-US": "https://333654.xyz/tools/word-to-pdf",
        "zh-CN": "https://333654.xyz/zh/tools/word-to-pdf",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "zh_CN",
      url: "https://333654.xyz/tools/word-to-pdf",
      siteName: "All-in-One Toolbox",
      title: "Word to PDF Converter | All-in-One Toolbox",
      description: "Convert Word documents to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Word to PDF Converter | All-in-One Toolbox",
      description: "Convert Word documents to PDF with server-side LibreOffice processing.",
    },
  };
}