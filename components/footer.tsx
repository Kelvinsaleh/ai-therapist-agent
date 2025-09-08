// components/Footer.tsx
"use client";
import Link from "next/link";
import { MessageCircle, Headphones, NotebookPen, Users } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";

export function Footer() {
  const { user } = useSession();
  return (
    <footer className="w-full py-3 px-4 border-t bg-background flex justify-center gap-8 fixed bottom-0 left-0 z-50 shadow">
      <Link href="/therapy/memory-enhanced" className="flex flex-col items-center group">
        <MessageCircle className="w-7 h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-xs mt-1">AI Chat</span>
      </Link>
      <Link href="/meditations" className="flex flex-col items-center group">
        <Headphones className="w-7 h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-xs mt-1">Meditations</span>
      </Link>
      <Link href="/journaling" className="flex flex-col items-center group">
        <NotebookPen className="w-7 h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-xs mt-1">AI Journal</span>
      </Link>
      <Link href="/rescue-pairs" className="flex flex-col items-center group">
        <Users className="w-7 h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-xs mt-1">Rescue Pairs </span>
      </Link>
      {user?.email === "knsalee@gmail.com" && (
        <Link href="/admin/meditations" className="flex flex-col items-center group">
          <span className="w-7 h-7 rounded-full border text-xs flex items-center justify-center text-primary group-hover:scale-110 transition">ADM</span>
          <span className="text-xs mt-1">Admin</span>
        </Link>
      )}
    </footer>
  );
}