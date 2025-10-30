import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
