// components/Footer.tsx
"use client";
import Link from "next/link";
import { MessageCircle, Headphones, NotebookPen, Users } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { usePathname } from "next/navigation";

export function Footer() {
  const { user } = useSession();
  const pathname = usePathname();
  
  // Hide footer on individual chat pages (but show on sessions list)
  const hideFooter = 
    (pathname?.startsWith('/therapy/') && pathname !== '/therapy' && !pathname?.includes('/sessions')) ||
    pathname?.includes('/matching/chat/');
  
  if (hideFooter) return null;
  
  return (
    <footer
      className="w-full px-4 border-t bg-background md:shadow-none shadow"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Mobile: fixed bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 md:static z-50">
          <div className="py-2 md:py-3 bg-background border-t md:border-0 flex justify-around md:justify-center gap-8 md:gap-10">
      <Link href="/therapy" className="flex flex-col items-center group">
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-[10px] md:text-xs mt-1">AI Chat</span>
      </Link>
      <Link href="/meditations" className="flex flex-col items-center group">
        <Headphones className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-[10px] md:text-xs mt-1">Meditations</span>
      </Link>
      <Link href="/journaling" className="flex flex-col items-center group">
        <NotebookPen className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-[10px] md:text-xs mt-1">AI Journal</span>
      </Link>
      <Link href="/community" className="flex flex-col items-center group">
        <Users className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition" />
        <span className="text-[10px] md:text-xs mt-1">Community</span>
      </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}