// Server component - provides metadata and wraps client functionality
import { Metadata } from "next";
import ImageOptimizerClient from "./ImageOptimizerClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh ? "图片优化器 | All-in-One Toolbox" : "Image Optimizer | All-in-One Toolbox",
    description: isZh 
      ? "在浏览器中压缩和优化图片。支持 JPEG、PNG、WebP。隐私优先，不上传到服务器。" 
      : "Compress and optimize images in your browser. Supports JPEG, PNG, WebP. Privacy-first, no uploads to server.",
    alternates: {
      canonical: "https://333654.xyz/tools/image-optimizer",
      languages: {
        "en-US": "https://333654.xyz/tools/image-optimizer",
        "zh-CN": "https://333654.xyz/zh/tools/image-optimizer",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: "https://333654.xyz/tools/image-optimizer",
      siteName: "All-in-One Toolbox",
      title: isZh ? "图片优化器 | All-in-One Toolbox" : "Image Optimizer | All-in-One Toolbox",
      description: isZh 
        ? "在浏览器中压缩和优化图片。支持 JPEG、PNG、WebP。隐私优先，不上传到服务器。" 
        : "Compress and optimize images in your browser. Supports JPEG, PNG, WebP. Privacy-first, no uploads to server.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "图片优化器 | All-in-One Toolbox" : "Image Optimizer | All-in-One Toolbox",
      description: isZh 
        ? "在浏览器中压缩和优化图片。" 
        : "Compress and optimize images in your browser.",
    },
  };
}

export default function ImageOptimizerPage() {
  return <ImageOptimizerClient />;
}
