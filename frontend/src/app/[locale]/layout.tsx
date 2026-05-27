import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { PageTransition } from "@/animations/PageTransition";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { CustomCursor } from "@/components/CustomCursor";
import "../globals.css";
import { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  
  return {
    title: isZh 
      ? "All-in-One Toolbox | 免费在线文档与图片工具" 
      : "All-in-One Toolbox | Free Online Document & Image Tools",
    description: isZh
      ? "免费的在线工具集合，包括文档转换、图片优化和效率工具。隐私优先，纯浏览器处理。"
      : "A comprehensive collection of free online tools for document conversion, image optimization, and productivity. Privacy-first, browser-based processing.",
    keywords: isZh
      ? ["在线工具", "文档转换器", "图片优化", "PDF工具", "二维码生成器", "免费工具", "效率工具"]
      : ["online tools", "document converter", "image optimizer", "pdf tools", "qr code generator", "free tools", "productivity"],
    alternates: {
      canonical: BASE_URL,
      languages: {
        "en-US": BASE_URL,
        "zh-CN": `${BASE_URL}/zh`,
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: BASE_URL,
      siteName: "All-in-One Toolbox",
      title: isZh 
        ? "All-in-One Toolbox | 免费在线文档与图片工具" 
        : "All-in-One Toolbox | Free Online Document & Image Tools",
      description: isZh
        ? "免费的在线工具集合，包括文档转换、图片优化和效率工具。隐私优先，纯浏览器处理。"
        : "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh 
        ? "All-in-One Toolbox | 免费在线文档与图片工具" 
        : "All-in-One Toolbox | Free Online Document & Image Tools",
      description: isZh
        ? "免费的在线工具集合，包括文档转换、图片优化和效率工具"
        : "A comprehensive collection of free online tools for document conversion, image optimization, and productivity.",
    },
  };
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable} antialiased bg-canvas text-ink min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <Navbar />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <GrainOverlay />
            <CustomCursor />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}