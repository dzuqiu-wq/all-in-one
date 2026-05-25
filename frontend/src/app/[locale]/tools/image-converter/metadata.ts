import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "图片格式转换器 PNG/JPEG/WebP | All-in-One Toolbox"
      : "Image Format Converter (PNG/JPEG/WebP) | All-in-One Toolbox",
    description: isZh
      ? "在浏览器中转换 PNG、JPEG 和 WebP 图片。使用原生 Canvas 编码，无需上传。"
      : "Convert PNG, JPEG, and WebP images in your browser using native Canvas encoding. No upload required.",
    keywords: isZh
      ? ["图片转换", "PNG转JPEG", "WebP转换", "图片格式"]
      : ["image converter", "png to jpeg", "webp converter", "image format"],
    alternates: {
      canonical: "https://333654.xyz/tools/image-converter",
      languages: {
        "en-US": "https://333654.xyz/tools/image-converter",
        "zh-CN": "https://333654.xyz/zh/tools/image-converter",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/image-converter",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "图片格式转换器 PNG/JPEG/WebP | All-in-One Toolbox"
        : "Image Format Converter (PNG/JPEG/WebP) | All-in-One Toolbox",
      description: isZh
        ? "在浏览器中转换 PNG、JPEG 和 WebP 图片。使用原生 Canvas 编码，无需上传。"
        : "Convert PNG, JPEG, and WebP images in your browser using native Canvas encoding. No upload required.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "图片格式转换器 PNG/JPEG/WebP | All-in-One Toolbox"
        : "Image Format Converter (PNG/JPEG/WebP) | All-in-One Toolbox",
      description: isZh
        ? "在浏览器中转换 PNG、JPEG 和 WebP 图片。使用原生 Canvas 编码，无需上传。"
        : "Convert PNG, JPEG, and WebP images in your browser using native Canvas encoding. No upload required.",
    },
  };
}
