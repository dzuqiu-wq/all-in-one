import { Metadata } from "next";

// IMPORTANT: This file must be a server component (no "use client")

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "QR Code Generator | All-in-One Toolbox",
    description: "Generate beautiful QR codes for URLs, text, and contact information. Customizable colors, sizes, and error correction levels.",
    keywords: ["qr code generator", "qr code maker", "create qr code", "custom qr code", "qr code design", "dynamic qr"],
    alternates: {
      canonical: "https://333654.xyz/tools/qrcode-generator",
      languages: {
        "en-US": "https://333654.xyz/tools/qrcode-generator",
        "zh-CN": "https://333654.xyz/zh/tools/qrcode-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "zh_CN",
      url: "https://333654.xyz/tools/qrcode-generator",
      siteName: "All-in-One Toolbox",
      title: "QR Code Generator | All-in-One Toolbox",
      description: "Generate beautiful QR codes for URLs, text, and contact information.",
    },
    twitter: {
      card: "summary_large_image",
      title: "QR Code Generator | All-in-One Toolbox",
      description: "Generate beautiful QR codes with customizable colors and sizes.",
    },
  };
}