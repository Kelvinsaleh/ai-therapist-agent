import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/react";

// Initialize the fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "HOPE - AI Mental Health Companion",
    template: "%s | HOPE"
  },
  description: "Your personal AI companion for mental health support. Get 24/7 access to empathetic AI therapy, journaling, meditation, and crisis support.",
  keywords: ["AI therapy", "mental health", "therapy chatbot", "journaling", "meditation", "crisis support", "mental wellness"],
  authors: [{ name: "HOPE Team" }],
  creator: "HOPE",
  publisher: "HOPE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "HOPE - AI Mental Health Companion",
    description: "Your personal AI companion for mental health support. Get 24/7 access to empathetic AI therapy, journaling, meditation, and crisis support.",
    siteName: "HOPE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HOPE - AI Mental Health Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOPE - AI Mental Health Companion",
    description: "Your personal AI companion for mental health support.",
    images: ["/og-image.png"],
    creator: "@hope_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Header />
          <main className=" pb-20\>{children}</main>
          <Footer />
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
