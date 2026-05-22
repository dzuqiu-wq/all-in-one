import { Metadata } from "next";

// IMPORTANT: This file must be a server component (no "use client")

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "PDF Merge & Split Tool | All-in-One Toolbox",
    description: "Merge multiple PDFs or extract specific pages. Pure client-side processing in browser. No file upload, 100% privacy.",
    keywords: ["pdf merge", "pdf split", "combine pdf", "extract pdf pages", "pdf tool", "browser pdf"],
    alternates: {
      canonical: "https://333654.xyz/tools/pdf-merge-split",
      languages: {
        "en-US": "https://333654.xyz/tools/pdf-merge-split",
        "zh-CN": "https://333654.xyz/zh/tools/pdf-merge-split",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "zh_CN",
      url: "https://333654.xyz/tools/pdf-merge-split",
      siteName: "All-in-One Toolbox",
      title: "PDF Merge & Split Tool | All-in-One Toolbox",
      description: "Merge multiple PDFs or extract specific pages. Pure client-side processing.",
    },
    twitter: {
      card: "summary_large_image",
      title: "PDF Merge & Split Tool | All-in-One Toolbox",
      description: "Merge multiple PDFs or extract specific pages in browser.",
    },
  };
}