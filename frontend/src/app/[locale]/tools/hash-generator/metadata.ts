import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "哈希生成器 SHA-1/256/384/512 | All-in-One Toolbox"
      : "Hash Generator (SHA-1/256/384/512) | All-in-One Toolbox",
    description: isZh
      ? "使用浏览器原生 Web Crypto API 计算 SHA-1、SHA-256、SHA-384、SHA-512 哈希值。"
      : "Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes in your browser using the native Web Crypto API.",
    keywords: isZh
      ? ["哈希生成器", "SHA-256", "SHA-512", "Web Crypto"]
      : ["hash generator", "sha-256", "sha-512", "web crypto"],
    alternates: {
      canonical: "https://333654.xyz/tools/hash-generator",
      languages: {
        "en-US": "https://333654.xyz/tools/hash-generator",
        "zh-CN": "https://333654.xyz/zh/tools/hash-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/hash-generator",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "哈希生成器 SHA-1/256/384/512 | All-in-One Toolbox"
        : "Hash Generator (SHA-1/256/384/512) | All-in-One Toolbox",
      description: isZh
        ? "使用浏览器原生 Web Crypto API 计算 SHA-1、SHA-256、SHA-384、SHA-512 哈希值。"
        : "Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes in your browser using the native Web Crypto API.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "哈希生成器 SHA-1/256/384/512 | All-in-One Toolbox"
        : "Hash Generator (SHA-1/256/384/512) | All-in-One Toolbox",
      description: isZh
        ? "使用浏览器原生 Web Crypto API 计算 SHA-1、SHA-256、SHA-384、SHA-512 哈希值。"
        : "Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes in your browser using the native Web Crypto API.",
    },
  };
}
