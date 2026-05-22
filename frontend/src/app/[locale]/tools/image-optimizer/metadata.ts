import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh 
      ? "图片优化器与压缩器 | All-in-One Toolbox" 
      : "Image Optimizer & Compressor | All-in-One Toolbox",
    description: isZh
      ? "压缩图片并转换为 WebP 格式。智能压缩可在保持质量的同时将文件大小减少 80%。纯浏览器处理，无需上传，隐私安全。"
      : "Compress images and convert to WebP format. Smart compression reduces file size by up to 80% while preserving quality. Pure browser processing, no upload.",
    keywords: isZh
      ? ["图片压缩", "图片优化", "WebP转换", "JPG压缩", "PNG优化", "减少图片大小"]
      : ["image optimizer", "compress image", "webp converter", "image compression", "reduce image size", "jpg to webp"],
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
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/image-optimizer",
      siteName: "All-in-One Toolbox",
      title: isZh 
        ? "图片优化器与压缩器 | All-in-One Toolbox" 
        : "Image Optimizer & Compressor | All-in-One Toolbox",
      description: isZh
        ? "压缩图片并转换为 WebP 格式。智能压缩可在保持质量的同时将文件大小减少 80%。"
        : "Compress images and convert to WebP format. Smart compression reduces file size by up to 80%.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh 
        ? "图片优化器与压缩器 | All-in-One Toolbox" 
        : "Image Optimizer & Compressor | All-in-One Toolbox",
      description: isZh
        ? "压缩图片并转换为 WebP 格式"
        : "Compress images and convert to WebP format.",
    },
  };
}