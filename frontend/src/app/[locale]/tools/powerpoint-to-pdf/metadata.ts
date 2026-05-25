import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "PowerPoint 转 PDF 转换器 | All-in-One Toolbox"
      : "PowerPoint to PDF Converter | All-in-One Toolbox",
    description: isZh
      ? "使用服务端 LibreOffice Impress 将 PowerPoint 演示文稿 (.pptx, .ppt) 转换为 PDF。纯内存管道，5MB 大小限制，5 秒超时。"
      : "Convert PowerPoint presentations (.pptx, .ppt) to PDF with server-side LibreOffice. Memory-only pipeline, 5MB limit, 5-second timeout.",
    keywords: isZh
      ? ["PowerPoint转PDF", "PPTX转PDF", "演示文稿转换", "PDF转换"]
      : ["powerpoint to pdf", "pptx to pdf", "presentation converter", "pdf conversion"],
    alternates: {
      canonical: "https://333654.xyz/tools/powerpoint-to-pdf",
      languages: {
        "en-US": "https://333654.xyz/tools/powerpoint-to-pdf",
        "zh-CN": "https://333654.xyz/zh/tools/powerpoint-to-pdf",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/powerpoint-to-pdf",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "PowerPoint 转 PDF 转换器 | All-in-One Toolbox"
        : "PowerPoint to PDF Converter | All-in-One Toolbox",
      description: isZh
        ? "使用服务端 LibreOffice Impress 将 PowerPoint 演示文稿转换为 PDF。纯内存管道处理，文件绝不上传磁盘。"
        : "Convert PowerPoint presentations to PDF with server-side LibreOffice Impress processing. 100% secure with memory-only pipeline.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "PowerPoint 转 PDF 转换器 | All-in-One Toolbox"
        : "PowerPoint to PDF Converter | All-in-One Toolbox",
      description: isZh
        ? "使用服务端 LibreOffice Impress 将 PowerPoint 演示文稿转换为 PDF"
        : "Convert PowerPoint presentations to PDF with server-side LibreOffice Impress processing.",
    },
  };
}
