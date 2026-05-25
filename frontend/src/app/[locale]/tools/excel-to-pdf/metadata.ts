import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "Excel 转 PDF 转换器 | All-in-One Toolbox"
      : "Excel to PDF Converter | All-in-One Toolbox",
    description: isZh
      ? "使用服务端 LibreOffice 处理将 Excel 表格转换为 PDF。纯内存管道处理，文件绝不上传磁盘。5秒快速超时，100%隐私安全。"
      : "Convert Excel spreadsheets to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline, no disk storage. Fast 5-second timeout.",
    keywords: isZh
      ? ["Excel转PDF", "XLSX转PDF", "电子表格转换", "PDF转换", "在线转换工具", "LibreOffice"]
      : ["excel to pdf", "xlsx to pdf", "spreadsheet converter", "libreoffice", "pdf conversion", "online converter"],
    alternates: {
      canonical: "https://333654.xyz/tools/excel-to-pdf",
      languages: {
        "en-US": "https://333654.xyz/tools/excel-to-pdf",
        "zh-CN": "https://333654.xyz/zh/tools/excel-to-pdf",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/excel-to-pdf",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "Excel 转 PDF 转换器 | All-in-One Toolbox"
        : "Excel to PDF Converter | All-in-One Toolbox",
      description: isZh
        ? "使用服务端 LibreOffice 处理将 Excel 表格转换为 PDF。纯内存管道处理，文件绝不上传磁盘。"
        : "Convert Excel spreadsheets to PDF with server-side LibreOffice processing. 100% secure with memory-only pipeline.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "Excel 转 PDF 转换器 | All-in-One Toolbox"
        : "Excel to PDF Converter | All-in-One Toolbox",
      description: isZh
        ? "使用服务端 LibreOffice 处理将 Excel 表格转换为 PDF"
        : "Convert Excel spreadsheets to PDF with server-side LibreOffice processing.",
    },
  };
}
