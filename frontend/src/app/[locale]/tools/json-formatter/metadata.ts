import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "JSON 格式化与校验工具 | All-in-One Toolbox"
      : "JSON Formatter & Validator | All-in-One Toolbox",
    description: isZh
      ? "纯浏览器端 JSON 美化、压缩与校验工具。调用原生 JSON.parse 引擎，零上传、零网络往返，符合 ECMA-404 标准。"
      : "Pure client-side JSON formatter, minifier and validator. Runs against the native JSON.parse engine inside your browser — zero upload, zero network round-trip, ECMA-404 compliant.",
    keywords: isZh
      ? ["JSON 格式化", "JSON 校验", "JSON 美化", "JSON 压缩", "ECMA-404", "在线 JSON 工具", "纯客户端"]
      : ["json formatter", "json validator", "json minifier", "json beautifier", "ecma-404", "online json tool", "client-side json"],
    alternates: {
      canonical: "https://333654.xyz/tools/json-formatter",
      languages: {
        "en-US": "https://333654.xyz/tools/json-formatter",
        "zh-CN": "https://333654.xyz/zh/tools/json-formatter",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/json-formatter",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "JSON 格式化与校验工具 | All-in-One Toolbox"
        : "JSON Formatter & Validator | All-in-One Toolbox",
      description: isZh
        ? "纯浏览器端 JSON 美化、压缩与校验，调用原生 JSON.parse，零上传。"
        : "Format, minify and validate JSON entirely in your browser — native JSON.parse, no upload.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "JSON 格式化与校验工具 | All-in-One Toolbox"
        : "JSON Formatter & Validator | All-in-One Toolbox",
      description: isZh
        ? "纯浏览器端 JSON 美化、压缩与校验，调用原生 JSON.parse。"
        : "Format, minify and validate JSON entirely in your browser.",
    },
  };
}
