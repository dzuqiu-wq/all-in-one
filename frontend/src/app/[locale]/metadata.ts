import { Metadata } from "next";
import { getToolMetadata, homeMetadata } from "@/i18n/metadata";
import StructuredData from "@/i18n/StructuredData";
import { ToolSlug } from "@/i18n/metadata";

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

// Generate metadata for the [locale] layout
export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  if (locale === "zh") {
    return {
      title: {
        default: "All-in-One Toolbox | 免费在线文档与图片工具",
        template: "%s | All-in-One Toolbox",
      },
      description: "免费的在线工具集合，包括文档转换、图片优化和效率工具。隐私优先，纯浏览器处理。",
      keywords: ["在线工具", "文档转换器", "图片优化", "PDF工具", "二维码生成器", "免费工具", "效率工具"],
      alternates: {
        canonical: "https://333654.xyz/zh",
        languages: {
          "en-US": "https://333654.xyz",
          "zh-CN": "https://333654.xyz/zh",
        },
      },
      openGraph: {
        type: "website",
        locale: "zh_CN",
        alternateLocale: "en_US",
        url: "https://333654.xyz/zh",
        siteName: "All-in-One Toolbox",
        title: "All-in-One Toolbox | 免费在线文档与图片工具",
        description: "免费的在线工具集合，包括文档转换、图片优化和效率工具。隐私优先，纯浏览器处理。",
      },
    };
  }
  
  return homeMetadata;
}

// Component wrapper for structured data
export function StructuredDataWrapper({ tool, locale }: { tool: ToolSlug; locale: string }) {
  return <StructuredData tool={tool} locale={locale as "en" | "zh"} />;
}

export { getToolMetadata };