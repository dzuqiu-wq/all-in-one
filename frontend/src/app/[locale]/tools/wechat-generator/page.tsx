// Server component - provides metadata and wraps client functionality
import { Metadata } from "next";
import WechatGeneratorClient from "./WechatGeneratorClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  const title = isZh
    ? "微信聊天记录生成器 | All-in-One Toolbox"
    : "WeChat Chat History Generator | All-in-One Toolbox";
  const description = isZh
    ? "生成像素级精准的微信聊天截图，用于设计稿、产品演示与编辑配图——纯浏览器渲染，零上传。"
    : "Build pixel-perfect WeChat chat mockups for design reviews and editorial illustration — all rendered inside your browser.";

  return {
    title,
    description,
    keywords: isZh
      ? ["微信聊天生成器", "微信截图", "聊天Mockup", "微信设计稿", "微信对话"]
      : ["wechat chat generator", "wechat mockup", "chat screenshot", "wechat design", "conversation mockup"],
    alternates: {
      canonical: "BASE_URL/tools/wechat-generator",
      languages: {
        "en-US": "BASE_URL/tools/wechat-generator",
        "zh-CN": "BASE_URL/zh/tools/wechat-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "BASE_URL/tools/wechat-generator",
      siteName: "All-in-One Toolbox",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function WechatGeneratorPage({ params }: Props) {
  const { locale } = await params;
  return <WechatGeneratorClient locale={locale} />;
}