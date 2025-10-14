// components/Footer.tsx
"use client";
import Link from "next/link";
import { MessageCircle, Headphones, NotebookPen, User } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { usePathname } from "next/navigation";

export function Footer() {
  const { user } = useSession();
  const pathname = usePathname();
  
  // Remove the hideFooter logic - always show footer
  // const hideFooter = pathname?.includes('/therapy/') || 
  //                   pathname?.includes('/matching/chat/') ||
  //                   pathname?.includes('/journaling');
  
  // if (hideFooter) return null;
  
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
      <Link href="/profile" className="flex flex-col items-center group">
        <User className="w-7 h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </footer>
  );
}