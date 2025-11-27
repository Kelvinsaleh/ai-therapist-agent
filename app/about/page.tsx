"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Target, Sparkles, Mail, MessageCircleHeart, Smartphone } from "lucide-react";
import { MobileDownloadButton } from "@/components/mobile-download-button";

const missions = [
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Our Mission",
    description:
      "Make caring mental health support feel human, accessible, and practical — so anyone can check in, feel heard, and get gentle next steps when they need them.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Our Vision",
    description:
      "A world where everyday care is normal: warm AI conversations, simple tools for growth, and communities that feel safe and kind.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Our Values",
    description:
      "Warmth over jargon, privacy by default, small steps that add up, and design that reduces friction rather than adding it.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          About Hope
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Hope is a warm, AI‑guided space for mental wellness. It blends supportive chat, journaling, mood tracking,
          community spaces, meditations, and a weekly wellness review that helps you notice progress without pressure.
        </p>
      </motion.div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4 flex justify-center">{mission.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{mission.title}</h3>
              <p className="text-muted-foreground">{mission.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile App Download Section */}
      {process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">Download Our Mobile App</h3>
                <p className="text-muted-foreground mb-4">
                  Get the Hope app on your Android device for the best mobile experience.
                </p>
                <MobileDownloadButton variant="default" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Contact / Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="p-6 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Contact Us</h3>
              <p className="text-muted-foreground mb-4">
                Have a question, feedback, or need support? We're here to help.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  Email: <a href="mailto:support@hope-therapy.com" className="text-primary underline">support@hope-therapy.com</a>
                </p>
                <p>
                  Community: Open the app's Community tab to share suggestions or ask for help.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
