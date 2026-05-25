import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "颜色转换器（HEX / RGB / HSL） | All-in-One Toolbox"
      : "Color Converter (HEX / RGB / HSL) | All-in-One Toolbox",
    description: isZh
      ? "在 HEX、RGB 和 HSL 颜色空间之间转换，实时预览。所有计算在浏览器中完成。"
      : "Convert between HEX, RGB, and HSL color spaces with live preview. All math runs in your browser.",
    keywords: isZh
      ? ["颜色转换", "HEX转RGB", "RGB转HSL", "颜色选择器"]
      : ["color converter", "hex to rgb", "rgb to hsl", "color picker"],
    alternates: {
      canonical: "https://333654.xyz/tools/color-converter",
      languages: {
        "en-US": "https://333654.xyz/tools/color-converter",
        "zh-CN": "https://333654.xyz/zh/tools/color-converter",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/color-converter",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "颜色转换器（HEX / RGB / HSL） | All-in-One Toolbox"
        : "Color Converter (HEX / RGB / HSL) | All-in-One Toolbox",
      description: isZh
        ? "在 HEX、RGB 和 HSL 颜色空间之间转换，实时预览。所有计算在浏览器中完成。"
        : "Convert between HEX, RGB, and HSL color spaces with live preview. All math runs in your browser.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "颜色转换器（HEX / RGB / HSL） | All-in-One Toolbox"
        : "Color Converter (HEX / RGB / HSL) | All-in-One Toolbox",
      description: isZh
        ? "在 HEX、RGB 和 HSL 颜色空间之间转换，实时预览。所有计算在浏览器中完成。"
        : "Convert between HEX, RGB, and HSL color spaces with live preview. All math runs in your browser.",
    },
  };
}
