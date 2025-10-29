"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
	Brain,
	Shield,
	Fingerprint,
	Activity,
	Bot,
	LineChart,
	Heart,
	MessageCircle,
	Images,
	Notebook,
	Smile,
	PlayCircle,
	BarChart3,
	CreditCard
} from "lucide-react";

const features = [
	{
		icon: <Bot className="w-10 h-10 text-primary" />,
		title: "AI Therapist (Warm & Conversational)",
		description:
			"Talk to a supportive AI that responds like a caring friend — empathetic, practical, and solution-focused.",
	},
	{
		icon: <BarChart3 className="w-10 h-10 text-primary" />,
		title: "Weekly Wellness Review",
		description:
			"Auto‑generated 150–250 word summaries of your week: mood trends, highlights, challenges, and gentle guidance.",
	},
	{
		icon: <MessageCircle className="w-10 h-10 text-primary" />,
		title: "Community Feed & Spaces",
		description:
			"Post with images, choose anonymous or named, reply to comments, and delete your content when needed.",
	},
	{
		icon: <Images className="w-10 h-10 text-primary" />,
		title: "Image Uploads (Vercel Blob)",
		description:
			"Fast, reliable image storage for posts and comments with a clean, tap‑to‑zoom lightbox experience.",
	},
	{
		icon: <Notebook className="w-10 h-10 text-primary" />,
		title: "Private Journaling",
		description:
			"Capture thoughts and reflections securely to spot patterns and support deeper self‑understanding.",
	},
	{
		icon: <Smile className="w-10 h-10 text-primary" />,
		title: "Mood Tracking & Insights",
		description:
			"Log daily moods and see trends over time to understand your emotional rhythm and triggers.",
	},
	{
		icon: <Heart className="w-10 h-10 text-primary" />,
		title: "Guided Meditations",
		description:
			"Calming sessions with session history to help you reset, breathe, and sleep better.",
	},
	{
		icon: <Brain className="w-10 h-10 text-primary" />,
		title: "CBT Tools",
		description:
			"Thought records and supportive insights that translate challenges into clear, doable next steps.",
	},
	{
		icon: <LineChart className="w-10 h-10 text-primary" />,
		title: "Profile Analytics",
		description:
			"A single place for your data: mood trends, activity highlights, and your Weekly Reviews.",
	},
	{
		icon: <Shield className="w-10 h-10 text-primary" />,
		title: "Secure Auth & Email Verification",
		description:
			"Account protection with verification emails and sensible privacy defaults for a safe experience.",
	},
	{
		icon: <CreditCard className="w-10 h-10 text-primary" />,
		title: "Premium Subscription (KES)",
		description:
			"Simple billing via Paystack — KES 1,300/month or KES 13,000/year with best‑value annual savings.",
	},
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Platform Features
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover how our AI-powered platform revolutionizes mental health
          support with cutting-edge technology and unwavering privacy
          protection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-16"
      >
        <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of users benefiting from AI-powered mental health
          support.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Your Journey
          <Heart className="ml-2 w-5 h-5" />
        </a>
      </motion.div>
    </div>
  );
}
