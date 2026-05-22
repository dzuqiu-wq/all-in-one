import { Metadata } from "next";

// IMPORTANT: This file must be a server component (no "use client")

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Image Optimizer & Compressor | All-in-One Toolbox",
    description: "Compress images and convert to WebP format. Smart compression reduces file size by up to 80% while preserving quality.",
    keywords: ["image optimizer", "compress image", "webp converter", "image compression", "reduce image size", "jpg to webp"],
    alternates: {
      canonical: "https://333654.xyz/tools/image-optimizer",
      languages: {
        "en-US": "https://333654.xyz/tools/image-optimizer",
        "zh-CN": "https://333654.xyz/zh/tools/image-optimizer",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "zh_CN",
      url: "https://333654.xyz/tools/image-optimizer",
      siteName: "All-in-One Toolbox",
      title: "Image Optimizer & Compressor | All-in-One Toolbox",
      description: "Compress images and convert to WebP format. Smart compression reduces file size by up to 80%.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Image Optimizer & Compressor | All-in-One Toolbox",
      description: "Compress images and convert to WebP format.",
    },
  };
}