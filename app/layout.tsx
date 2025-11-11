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
  title: "Hope — AI Mental Health Companion | Meditations, Journaling & Support Community",
  description:
    "Find calm and clarity with Hope — your AI-powered mental health companion. Chat safely, explore guided meditations, journal with AI insights, and connect with a supportive community. Start free on ultra-predict.co.ke.",
  keywords: [
    "mental health app",
    "AI therapy",
    "meditation app",
    "journaling app",
    "mindfulness",
    "mental wellness",
    "self care",
    "anxiety support",
    "depression help",
    "emotional support",
    "Hope app",
    "AI mental health companion",
    "ultra predict",
    "ultra-predict.co.ke",
  ],
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "Hope by Ultra Predict" }],
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  // Metadata base ensures OG/Twitter absolute URLs
  metadataBase: new URL("https://ultra-predict.co.ke"),
  openGraph: {
    type: "website",
    url: "https://ultra-predict.co.ke/",
    title: "Hope — Your AI Mental Health Companion",
    description:
      "Talk, heal, and grow. Hope is your safe space for mental health — featuring AI chat, guided meditations, journaling, and a caring community.",
    siteName: "Hope",
    images: [
      {
        url: "https://ultra-predict.co.ke/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hope — AI Mental Health Companion",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope — AI Mental Health Companion",
    description:
      "Find peace of mind with Hope. Chat with an AI companion, meditate, journal, and connect with others who understand.",
    images: ["https://ultra-predict.co.ke/og-image.jpg"],
  },
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
