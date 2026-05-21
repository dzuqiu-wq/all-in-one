import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { Inter, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const dynamic = 'force-dynamic';

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
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="adsbygoogle-init" strategy="afterInteractive">
          {`
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-0000000000000000",
              enable_page_level_ads: true
            });
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased bg-[var(--bg-primary)]`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col bg-grid">
            <div className="mx-auto w-full max-w-5xl px-4 pt-3">
              <AdBanner slot="global-top" format="auto" className="w-full" />
            </div>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer version="0.1.0" />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}