import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "UUID 生成器 · RFC 4122 v4 | All-in-One Toolbox"
      : "UUID Generator · RFC 4122 v4 | All-in-One Toolbox",
    description: isZh
      ? "在浏览器中生成密码学随机的 UUID（RFC 4122 v4）。一次最多 10,000 个，使用 crypto.randomUUID。无服务器、无追踪。"
      : "Generate cryptographically random UUIDs (RFC 4122 v4) in your browser using crypto.randomUUID. Up to 10,000 at once. No server, no tracking.",
    keywords: isZh
      ? ["UUID生成", "UUID v4", "GUID生成", "RFC 4122"]
      : ["uuid generator", "uuid v4", "guid generator", "rfc 4122"],
    alternates: {
      canonical: "https://333654.xyz/tools/uuid-generator",
      languages: {
        "en-US": "https://333654.xyz/tools/uuid-generator",
        "zh-CN": "https://333654.xyz/zh/tools/uuid-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/uuid-generator",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "UUID 生成器 · RFC 4122 v4 | All-in-One Toolbox"
        : "UUID Generator · RFC 4122 v4 | All-in-One Toolbox",
      description: isZh
        ? "在浏览器中生成密码学随机的 UUID（RFC 4122 v4）。一次最多 10,000 个。"
        : "Generate cryptographically random UUIDs (RFC 4122 v4) in your browser. Up to 10,000 at once.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "UUID 生成器 · RFC 4122 v4 | All-in-One Toolbox"
        : "UUID Generator · RFC 4122 v4 | All-in-One Toolbox",
      description: isZh
        ? "在浏览器中生成密码学随机的 UUID（RFC 4122 v4）。"
        : "Generate cryptographically random UUIDs (RFC 4122 v4) in your browser.",
    },
  };
}
