import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../globals.css";

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
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer version="0.1.0" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}