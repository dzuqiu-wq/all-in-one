import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh 
      ? "Word 转 PDF 转换器 | All-in-One Toolbox" 
      : "Word to PDF Converter | All-in-One Toolbox",
    description: isZh
      ? "使用服务端 LibreOffice 处理将 Word 文档转换为 PDF。纯内存管道处理，文件绝不上传磁盘。5秒快速超时，100%隐私安全。"
      : "Convert Word documents to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline, no disk storage. Fast 5-second timeout.",
    keywords: isZh
      ? ["Word转PDF", "DOCX转PDF", "文档转换器", "PDF转换", "在线转换工具", "LibreOffice"]
      : ["word to pdf", "docx to pdf", "document converter", "libreoffice", "pdf conversion", "online converter"],
    alternates: {
      canonical: "https://333654.xyz/tools/word-to-pdf",
      languages: {
        "en-US": "https://333654.xyz/tools/word-to-pdf",
        "zh-CN": "https://333654.xyz/zh/tools/word-to-pdf",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/word-to-pdf",
      siteName: "All-in-One Toolbox",
      title: isZh 
        ? "Word 转 PDF 转换器 | All-in-One Toolbox" 
        : "Word to PDF Converter | All-in-One Toolbox",
      description: isZh
        ? "使用服务端 LibreOffice 处理将 Word 文档转换为 PDF。纯内存管道处理，文件绝不上传磁盘。"
        : "Convert Word documents to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh 
        ? "Word 转 PDF 转换器 | All-in-One Toolbox" 
        : "Word to PDF Converter | All-in-One Toolbox",
      description: isZh
        ? "使用服务端 LibreOffice 处理将 Word 文档转换为 PDF"
        : "Convert Word documents to PDF with server-side LibreOffice processing.",
    },
  };
}