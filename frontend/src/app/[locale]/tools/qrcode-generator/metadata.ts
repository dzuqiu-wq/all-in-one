import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh 
      ? "二维码生成器 | All-in-One Toolbox" 
      : "QR Code Generator | All-in-One Toolbox",
    description: isZh
      ? "为网址、文本和联系人信息生成精美的二维码。可自定义颜色、尺寸和纠错级别。纯客户端生成，无需服务器处理。"
      : "Generate beautiful QR codes for URLs, text, and contact information. Customizable colors, sizes, and error correction levels. Pure client-side generation.",
    keywords: isZh
      ? ["二维码生成器", "QR码制作", "创建二维码", "自定义二维码", "二维码设计", "二维码工具"]
      : ["qr code generator", "qr code maker", "create qr code", "custom qr code", "qr code design", "dynamic qr"],
    alternates: {
      canonical: "https://333654.xyz/tools/qrcode-generator",
      languages: {
        "en-US": "https://333654.xyz/tools/qrcode-generator",
        "zh-CN": "https://333654.xyz/zh/tools/qrcode-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/qrcode-generator",
      siteName: "All-in-One Toolbox",
      title: isZh 
        ? "二维码生成器 | All-in-One Toolbox" 
        : "QR Code Generator | All-in-One Toolbox",
      description: isZh
        ? "为网址、文本和联系人信息生成精美的二维码。可自定义颜色、尺寸和纠错级别。"
        : "Generate beautiful QR codes for URLs, text, and contact information.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh 
        ? "二维码生成器 | All-in-One Toolbox" 
        : "QR Code Generator | All-in-One Toolbox",
      description: isZh
        ? "为网址、文本和联系人信息生成精美的二维码"
        : "Generate beautiful QR codes with customizable colors and sizes.",
    },
  };
}