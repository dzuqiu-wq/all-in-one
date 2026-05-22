// Server component - provides metadata and wraps client functionality
import { Metadata } from "next";
import PdfMergeSplitClient from "./PdfMergeSplitClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "PDF 合并与拆分工具 | All-in-One Toolbox"
      : "PDF Merge & Split Tool | All-in-One Toolbox",
    description: isZh
      ? "合并多个 PDF 或提取文档中的特定页面。纯浏览器端处理，无需上传文件。100%隐私保护，完全免费无限制使用。"
      : "Merge multiple PDFs or extract specific pages from documents. Pure client-side processing in browser. No file upload, 100% privacy. Free and unlimited.",
    keywords: isZh
      ? ["PDF合并", "PDF拆分", "合并PDF", "提取页面", "PDF工具", "浏览器PDF"]
      : ["pdf merge", "pdf split", "combine pdf", "extract pdf pages", "pdf tool", "browser pdf"],
    alternates: {
      canonical: "https://333654.xyz/tools/pdf-merge-split",
      languages: {
        "en-US": "https://333654.xyz/tools/pdf-merge-split",
        "zh-CN": "https://333654.xyz/zh/tools/pdf-merge-split",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/pdf-merge-split",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "PDF 合并与拆分工具 | All-in-One Toolbox"
        : "PDF Merge & Split Tool | All-in-One Toolbox",
      description: isZh
        ? "合并多个 PDF 或提取文档中的特定页面。纯浏览器端处理，无需上传文件。"
        : "Merge multiple PDFs or extract specific pages. Pure client-side processing.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "PDF 合并与拆分工具 | All-in-One Toolbox"
        : "PDF Merge & Split Tool | All-in-One Toolbox",
      description: isZh
        ? "合并多个 PDF 或提取文档中的特定页面"
        : "Merge multiple PDFs or extract specific pages in browser.",
    },
  };
}

export default function PdfMergeSplitPage() {
  return <PdfMergeSplitClient />;
}
