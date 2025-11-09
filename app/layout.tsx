import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/lib/contexts/session-context";
import { AudioPlayerProvider } from "@/lib/contexts/audio-player-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SkipToMainContent, SkipToNavigation } from "@/components/ui/skip-link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hope - AI Therapist",
  description: "Your personal AI therapist for mental health support",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Hope - AI Therapist",
    description: "Your personal AI therapist for mental health support",
    url: process.env.NEXT_PUBLIC_SITE_URL || "",
    siteName: "Hope AI",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Hope - AI Therapist - Your personal AI therapist for mental health support",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope - AI Therapist",
    description: "Your personal AI therapist for mental health support",
    images: ["/icon.png"],
    creator: "@hopeai",
  },
  ...(process.env.NEXT_PUBLIC_SITE_URL && {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  }),
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6JJDGJTFDJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6JJDGJTFDJ');
          `}
        </Script>
        <SkipToMainContent />
        <SkipToNavigation />
        <ThemeProvider>
          <SessionProvider>
            <AudioPlayerProvider>
              <Header />
              <main id="main-content" className="min-h-screen pt-16 pb-20 md:pb-0" role="main">
                {children}
              </main>
              <Footer />
              <Toaster />
            </AudioPlayerProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
