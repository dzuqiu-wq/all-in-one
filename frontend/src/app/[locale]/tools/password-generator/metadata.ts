import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "密码生成器 · 浏览器端 CSPRNG | All-in-One Toolbox"
      : "Password Generator · CSPRNG in your browser | All-in-One Toolbox",
    description: isZh
      ? "使用浏览器原生 Web Crypto CSPRNG（crypto.getRandomValues）生成密码学安全的随机密码。可配置长度与字符类别，实时强度评估。"
      : "Generate cryptographically secure passwords in your browser using the native Web Crypto CSPRNG (crypto.getRandomValues). Configurable length and character classes, real-time strength meter.",
    keywords: isZh
      ? ["密码生成器", "CSPRNG", "Web Crypto", "随机密码", "强密码"]
      : [
          "password generator",
          "csprng",
          "web crypto",
          "secure password",
          "random password",
        ],
    alternates: {
      canonical: "https://333654.xyz/tools/password-generator",
      languages: {
        "en-US": "https://333654.xyz/tools/password-generator",
        "zh-CN": "https://333654.xyz/zh/tools/password-generator",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/password-generator",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "密码生成器 · 浏览器端 CSPRNG | All-in-One Toolbox"
        : "Password Generator · CSPRNG in your browser | All-in-One Toolbox",
      description: isZh
        ? "使用浏览器原生 Web Crypto CSPRNG（crypto.getRandomValues）生成密码学安全的随机密码。"
        : "Generate cryptographically secure passwords in your browser using the native Web Crypto CSPRNG (crypto.getRandomValues).",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "密码生成器 · 浏览器端 CSPRNG | All-in-One Toolbox"
        : "Password Generator · CSPRNG in your browser | All-in-One Toolbox",
      description: isZh
        ? "使用浏览器原生 Web Crypto CSPRNG 生成密码学安全的随机密码。"
        : "Generate cryptographically secure passwords in your browser using the native Web Crypto CSPRNG.",
    },
  };
}
