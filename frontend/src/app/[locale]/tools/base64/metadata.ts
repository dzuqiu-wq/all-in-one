import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "Base64 编解码器 | All-in-One Toolbox"
      : "Base64 Encoder & Decoder | All-in-One Toolbox",
    description: isZh
      ? "在浏览器中编解码 Base64，支持 URL-safe 变体。"
      : "Encode and decode Base64 in your browser. URL-safe variant supported.",
    keywords: isZh
      ? ["Base64编码", "Base64解码", "URL-safe Base64", "在线编码"]
      : ["base64 encoder", "base64 decoder", "url-safe base64", "encode online"],
    alternates: {
      canonical: "https://333654.xyz/tools/base64",
      languages: {
        "en-US": "https://333654.xyz/tools/base64",
        "zh-CN": "https://333654.xyz/zh/tools/base64",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/base64",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "Base64 编解码器 | All-in-One Toolbox"
        : "Base64 Encoder & Decoder | All-in-One Toolbox",
      description: isZh
        ? "在浏览器中编解码 Base64，支持 URL-safe 变体。"
        : "Encode and decode Base64 in your browser. URL-safe variant supported.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "Base64 编解码器 | All-in-One Toolbox"
        : "Base64 Encoder & Decoder | All-in-One Toolbox",
      description: isZh
        ? "在浏览器中编解码 Base64，支持 URL-safe 变体。"
        : "Encode and decode Base64 in your browser. URL-safe variant supported.",
    },
  };
}
