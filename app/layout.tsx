import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { AudioPlayerProvider } from "@/lib/contexts/audio-player-context";

// Initialize the fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hope - AI Therapist",
  description: "Your personal AI therapist for mental health support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          <AudioPlayerProvider>
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            
            <GlobalAudioPlayer />
            <Toaster />
          </AudioPlayerProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

"use client";

import { useAudioPlayer } from "@/lib/contexts/audio-player-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, X, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalAudioPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    togglePlayPause, 
    stop, 
    seek,
    setVolume 
  } = useAudioPlayer();

  const [showVolume, setShowVolume] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-lg border-primary/20 shadow-2xl">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎵</span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" onClick={togglePlayPause} className="h-10 w-10">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <div className="relative hidden sm:block">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowVolume(!showVolume)}
                    className="h-10 w-10"
                  >
                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  {showVolume && (
                    <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg">
                      <Slider
                        value={[volume * 100]}
                        onValueChange={(value) => setVolume(value[0] / 100)}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>

                <Button size="icon" variant="ghost" onClick={stop} className="h-10 w-10">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <Slider
                value={[progress]}
                onValueChange={(value) => seek((value[0] / 100) * duration)}
                max={100}
                step={0.1}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
