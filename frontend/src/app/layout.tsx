import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

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

export const metadata: Metadata = {
  title: "All-in-One Toolbox | Cyberpunk Developer Tools",
  description: "Open-source developer toolkit for document conversion, image optimization, and productivity automation. Zero cost, pure client-side processing.",
  keywords: ["developer tools", "PDF converter", "image optimizer", "QR generator", "open source"],
  authors: [{ name: "All-in-One Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Google AdSense - Auto Ads Script */}
        {/* Replace 'ca-pub-0000000000000000' with your actual AdSense publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* AdSense Auto Configuration */}
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
        <div className="min-h-screen flex flex-col bg-grid">
          {/* Top Ad Banner */}
          <div className="mx-auto w-full max-w-5xl px-4 pt-3">
            <AdBanner slot="global-top" format="auto" className="w-full" />
          </div>

          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <Footer version="0.1.0" />
        </div>
      </body>
    </html>
  );
}