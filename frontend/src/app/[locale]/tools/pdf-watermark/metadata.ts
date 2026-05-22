import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "PDF 水印与印章工具 | All-in-One Toolbox"
      : "PDF Watermark & Stamp Tool | All-in-One Toolbox",
    description: isZh
      ? "为 PDF 添加文字水印或电子印章。纯浏览器处理，文件绝不上传服务器。支持平铺文字、标准公章样式、噪点模拟印泥效果。"
      : "Add text watermarks or electronic stamps to PDFs. Pure browser processing with pdf-lib. Supports tiled text, official stamp style, and ink noise simulation.",
    keywords: isZh
      ? ["PDF水印", "电子印章", "公章", "PDF工具", "在线水印", "PDF加印章", "文字水印"]
      : ["pdf watermark", "electronic stamp", "seal stamp", "pdf tool", "online watermark", "stamp generator", "text overlay"],
    alternates: {
      canonical: "https://333654.xyz/tools/pdf-watermark",
      languages: {
        "en-US": "https://333654.xyz/tools/pdf-watermark",
        "zh-CN": "https://333654.xyz/zh/tools/pdf-watermark",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/pdf-watermark",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "PDF 水印与印章工具"
        : "PDF Watermark & Stamp Tool",
      description: isZh
        ? "为 PDF 添加文字水印或电子印章"
        : "Add text watermarks or stamps to PDFs",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "PDF 水印与印章工具"
        : "PDF Watermark & Stamp Tool",
      description: isZh
        ? "为 PDF 添加文字水印或电子印章"
        : "Add text watermarks or stamps to PDFs",
    },
  };
}