import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "数据清洗与乱码修复工具 | All-in-One Toolbox"
      : "Data Sanitizer & Encoding Fixer | All-in-One Toolbox",
    description: isZh
      ? "自动检测并修复 CSV/Excel 乱码问题。支持 UTF-8、GBK 编码互转。一键导出为 Excel、CSV、JSON、Markdown 格式。"
      : "Auto-detect and fix CSV/Excel encoding issues. Convert between UTF-8 and GBK. Export to Excel, CSV, JSON, or Markdown instantly.",
    keywords: isZh
      ? ["数据清洗", "乱码修复", "CSV乱码", "Excel乱码", "编码转换", "UTF-8", "GBK", "数据格式转换"]
      : ["data sanitizer", "encoding fixer", "csv garbled", "excel encoding", "utf-8 gbk", "data conversion", "csv json"],
    alternates: {
      canonical: "https://333654.xyz/tools/data-sanitizer",
      languages: {
        "en-US": "https://333654.xyz/tools/data-sanitizer",
        "zh-CN": "https://333654.xyz/zh/tools/data-sanitizer",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/data-sanitizer",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "数据清洗与乱码修复工具"
        : "Data Sanitizer & Encoding Fixer",
      description: isZh
        ? "自动检测并修复 CSV/Excel 乱码问题"
        : "Auto-detect and fix CSV/Excel encoding issues",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "数据清洗与乱码修复工具"
        : "Data Sanitizer & Encoding Fixer",
      description: isZh
        ? "自动检测并修复 CSV/Excel 乱码问题"
        : "Auto-detect and fix CSV/Excel encoding issues",
    },
  };
}