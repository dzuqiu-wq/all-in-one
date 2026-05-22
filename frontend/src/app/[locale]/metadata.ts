import { Metadata } from "next";

// IMPORTANT: This file must be a server component (no "use client")

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All-in-One Toolbox | Free Online Document & Image Tools",
    description: "A comprehensive collection of free online tools for document conversion, image optimization, and productivity. Privacy-first, browser-based processing.",
    keywords: ["online tools", "document converter", "image optimizer", "pdf tools", "qr code generator", "free tools", "productivity"],
    alternates: {
      canonical: "https://333654.xyz",
      languages: {
        "en-US": "https://333654.xyz",
        "zh-CN": "https://333654.xyz/zh",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "zh_CN",
      url: "https://333654.xyz",
      siteName: "All-in-One Toolbox",
      title: "All-in-One Toolbox | Free Online Document & Image Tools",
      description: "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
    },
    twitter: {
      card: "summary_large_image",
      title: "All-in-One Toolbox | Free Online Document & Image Tools",
      description: "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
    },
  };
}