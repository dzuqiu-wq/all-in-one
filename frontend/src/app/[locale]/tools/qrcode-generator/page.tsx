// Server component - provides metadata and wraps client functionality
import { Metadata } from "next";
import QrcodeGeneratorClient from "./QrcodeGeneratorClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh ? "二维码生成器 | All-in-One Toolbox" : "QR Code Generator | All-in-One Toolbox",
    description: isZh 
      ? "为文本、URL、WiFi、邮件等生成二维码。下载为 PNG 或 SVG。完全免费，不追踪。" 
      : "Generate QR codes for text, URLs, WiFi, emails, and more. Download as PNG or SVG. Completely free, no tracking.",
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
      url: "https://333654.xyz/tools/qrcode-generator",
      siteName: "All-in-One Toolbox",
      title: isZh ? "二维码生成器 | All-in-One Toolbox" : "QR Code Generator | All-in-One Toolbox",
      description: isZh 
        ? "为文本、URL、WiFi、邮件等生成二维码。下载为 PNG 或 SVG。完全免费，不追踪。" 
        : "Generate QR codes for text, URLs, WiFi, emails, and more. Download as PNG or SVG. Completely free, no tracking.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "二维码生成器 | All-in-One Toolbox" : "QR Code Generator | All-in-One Toolbox",
      description: isZh ? "为文本、URL、WiFi、邮件等生成二维码。" : "Generate QR codes in your browser.",
    },
  };
}

export default function QrcodeGeneratorPage() {
  return <QrcodeGeneratorClient />;
}
