import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh 
      ? "All-in-One Toolbox | 免费在线文档与图片工具" 
      : "All-in-One Toolbox | Free Online Document & Image Tools",
    description: isZh
      ? "免费的在线工具集合，包括文档转换、图片优化和效率工具。隐私优先，纯浏览器处理。"
      : "A comprehensive collection of free online tools for document conversion, image optimization, and productivity. Privacy-first, browser-based processing.",
    keywords: isZh
      ? ["在线工具", "文档转换器", "图片优化", "PDF工具", "二维码生成器", "免费工具", "效率工具"]
      : ["online tools", "document converter", "image optimizer", "pdf tools", "qr code generator", "free tools", "productivity"],
    alternates: {
      canonical: "https://333654.xyz",
      languages: {
        "en-US": "https://333654.xyz",
        "zh-CN": "https://333654.xyz/zh",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz",
      siteName: "All-in-One Toolbox",
      title: isZh 
        ? "All-in-One Toolbox | 免费在线文档与图片工具" 
        : "All-in-One Toolbox | Free Online Document & Image Tools",
      description: isZh
        ? "免费的在线工具集合，包括文档转换、图片优化和效率工具。隐私优先，纯浏览器处理。"
        : "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh 
        ? "All-in-One Toolbox | 免费在线文档与图片工具" 
        : "All-in-One Toolbox | Free Online Document & Image Tools",
      description: isZh
        ? "免费的在线工具集合，包括文档转换、图片优化和效率工具"
        : "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
    },
  };
}