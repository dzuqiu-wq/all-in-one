import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "商务发票生成器 | All-in-One Toolbox"
      : "Invoice Generator | All-in-One Toolbox",
    description: isZh
      ? "在线生成专业商务发票。支持动态项目明细、自动计算税率和折扣、实时预览。一键导出 PDF，完全本地处理。"
      : "Generate professional business invoices online. Dynamic line items, automatic tax/discount calculation, real-time preview. Export to PDF instantly. 100% local processing.",
    keywords: isZh
      ? ["发票生成器", "商务发票", "PDF发票", "Invoice", "账单工具", "在线发票"]
      : ["invoice generator", "business invoice", "pdf invoice", "billing tool", "online invoice", "receipt generator"],
    alternates: {
      canonical: "https://333654.xyz/tools/invoice-generator",
      languages: {
        "en-US": "https://333654.xyz/tools/invoice-generator",
        "zh-CN": "https://333654.xyz/zh/tools/invoice-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/invoice-generator",
      siteName: "All-in-One Toolbox",
      title: isZh ? "商务发票生成器" : "Invoice Generator",
      description: isZh ? "在线生成专业商务发票" : "Generate professional business invoices",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "商务发票生成器" : "Invoice Generator",
      description: isZh ? "在线生成专业商务发票" : "Generate professional business invoices",
    },
  };
}