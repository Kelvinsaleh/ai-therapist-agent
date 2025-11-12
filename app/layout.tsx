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
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hope – AI Mental Health App | Journaling, Meditation, AI Chat & Community",
  description:
    "Hope is your all-in-one mental wellness app. Journal your thoughts, chat with an empathetic AI companion, practice calming meditations, and connect with a supportive mental health community. Heal and grow with Hope.",
  keywords: [
    "mental health app",
    "AI mental health",
    "meditation app",
    "guided meditation",
    "journaling app",
    "AI journaling",
    "self-care app",
    "therapy chat",
    "anxiety relief",
    "depression support",
    "mindfulness app",
    "AI companion",
    "mental wellness app",
    "Hope app",
    "stress management",
    "mental health community",
    "emotional support",
    "healing",
    "calm mind",
    "wellness tracker"
  ],
  authors: [{ name: "Hope Mental Wellness Team" }],
  robots: {
    index: true,
    follow: true,
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/icon.svg", sizes: "180x180", type: "image/svg+xml" }
    ]
  },
  metadataBase: new URL("https://ultra-predict.co.ke"),
  alternates: {
    canonical: "https://ultra-predict.co.ke/hope",
    languages: { en: "https://ultra-predict.co.ke/hope" },
  },
  openGraph: {
    type: "website",
    url: "https://ultra-predict.co.ke/hope",
    title: "Hope – AI Mental Health App for Journaling, Meditation & Support",
    description:
      "Heal your mind through journaling, guided meditations, and AI companionship. Join Hope – your safe space for mental wellness and community support.",
    siteName: "Hope",
    images: [
      {
        url: "https://ultra-predict.co.ke/assets/hope-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Hope — AI Mental Health App Preview",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope – Find Peace Through Journaling & Meditation",
    description:
      "Hope is your AI-powered mental wellness app for journaling, meditation, and emotional support. Heal with every thought you write.",
    images: ["https://ultra-predict.co.ke/assets/hope-cover.jpg"],
    site: "@HopeAppOfficial",
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
      <Head>
        {/* 🌿 HOPE APP | SEO MASTER META BLOCK */}
        <title>Hope – AI Mental Health App | Journaling, Meditation, AI Chat & Supportive Community</title>
        <meta name="description" content="Hope is your AI-powered mental wellness app designed to help you journal, meditate, chat with a compassionate AI, and connect with a global mental health community. Heal your mind and nurture peace every day." />
        <meta name="keywords" content="mental health app, AI mental health, journaling app, meditation app, AI journaling, guided meditation, mindfulness app, therapy chat, AI chat, anxiety relief, depression support, self-care app, mental wellness, stress management, mental health community, emotional healing, Hope app, AI therapy, wellbeing, journaling for anxiety, mental health Kenya, meditation for calm, digital therapy" />
        <meta name="author" content="Hope Mental Wellness" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://ultra-predict.co.ke/hope" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="Hope" />
        <meta name="application-name" content="Hope" />
        <link rel="alternate" hreflang="en" href="https://ultra-predict.co.ke/hope" />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Kenya" />
        <meta name="geo.position" content="-1.286389;36.817223" />
        {/* SOCIAL MEDIA (Open Graph + Twitter) */}
        <meta property="og:title" content="Hope – AI Mental Health App for Journaling, Meditation & Support" />
        <meta property="og:description" content="Journal, meditate, chat, and connect with a healing community. Hope helps you build calm, clarity, and connection through AI-powered mental wellness tools." />
        <meta property="og:image" content="https://ultra-predict.co.ke/assets/hope-cover.jpg" />
        <meta property="og:url" content="https://ultra-predict.co.ke/hope" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hope – Mental Wellness App" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hope – Your AI Mental Wellness App" />
        <meta name="twitter:description" content="Heal, journal, and meditate with Hope — your safe AI-powered space for mental wellness and community connection." />
        <meta name="twitter:image" content="https://ultra-predict.co.ke/assets/hope-cover.jpg" />
        <meta name="twitter:site" content="@HopeAppOfficial" />
        {/* STRUCTURED DATA (JSON-LD for Google Rich Results) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          "name": "Hope",
          "url": "https://ultra-predict.co.ke/hope",
          "image": "https://ultra-predict.co.ke/assets/hope-cover.jpg",
          "operatingSystem": "Android, iOS, Web",
          "applicationCategory": "HealthApplication",
          "description": "Hope is a holistic AI mental health app offering AI journaling, guided meditations, mindful AI chat, and a supportive community to promote emotional balance and mental wellness.",
          "publisher": {
            "@type": "Organization",
            "name": "Hope Mental Wellness",
            "url": "https://ultra-predict.co.ke"
          },
          "featureList": [
            "AI journaling for stress and anxiety management",
            "guided meditations for relaxation and focus",
            "AI chat for mental support, empathy, and motivation",
            "mental health community for shared healing and encouragement"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "312"
          },
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }) }} />
        {/* FEATURED PAGES META TAGS */}
        {/* 🪶 JOURNALING PAGE */}
        <link rel="alternate" hreflang="en" href="https://ultra-predict.co.ke/hope/journaling" />
        <meta property="article:section" content="AI Journaling for Mental Health" />
        <meta name="title" content="AI Journaling for Self-Care & Stress Relief | Hope App" />
        <meta name="description" content="Reflect, release, and heal through guided AI journaling on Hope. Track emotions, write freely, and gain clarity every day." />
        {/* 🧘 MEDITATION PAGE */}
        <link rel="alternate" hreflang="en" href="https://ultra-predict.co.ke/hope/meditation" />
        <meta property="article:section" content="Meditation for Mindfulness & Calm" />
        <meta name="title" content="Guided Meditations for Anxiety & Peace | Hope App" />
        <meta name="description" content="Experience calm and balance through guided meditations designed to reduce anxiety, quiet your mind, and improve sleep." />
        {/* 🤖 AI CHAT PAGE */}
        <link rel="alternate" hreflang="en" href="https://ultra-predict.co.ke/hope/chat" />
        <meta property="article:section" content="AI Chat for Emotional Support" />
        <meta name="title" content="AI Chat Companion for Mental Health | Hope App" />
        <meta name="description" content="Chat anytime with Hope’s empathetic AI companion for motivation, mindfulness, and emotional understanding." />
        {/* 💬 COMMUNITY PAGE */}
        <link rel="alternate" hreflang="en" href="https://ultra-predict.co.ke/hope/community" />
        <meta property="article:section" content="Mental Health Community & Support" />
        <meta name="title" content="Mental Health Community – Connect & Heal Together | Hope App" />
        <meta name="description" content="Join a global mental health community built around empathy, encouragement, and emotional healing. You’re not alone — find hope with us." />
      </Head>
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
