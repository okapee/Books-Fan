import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PopupManager } from "@/components/modals/PopupManager";
import { TrialExpiredBanner } from "@/components/banners/TrialExpiredBanner";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

const seoMetadata = generateSEOMetadata({
  url: "/",
});

export const metadata: Metadata = {
  ...seoMetadata,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Books Fan",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a365d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <Header />
          <TrialExpiredBanner />
          <main className="flex-1">{children}</main>
          <Footer />
          <PopupManager />
        </Providers>
      </body>
    </html>
  );
}
