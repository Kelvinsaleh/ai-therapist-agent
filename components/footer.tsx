// components/Footer.tsx
"use client";
import Link from "next/link";
import { MessageCircle, Headphones, NotebookPen, Users, Mail } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { usePathname } from "next/navigation";

export function Footer() {
  const { user } = useSession();
  const pathname = usePathname();
  
  // Hide footer only on individual chat conversation pages (not on main pages)
  // Show footer on: homepage, therapy list, meditations, journaling, community, etc.
  const hideFooter = 
    pathname && (
      (pathname.match(/^\/therapy\/[^\/]+$/) && !pathname.includes('/sessions')) ||
      pathname.includes('/matching/chat/')
    );
  
  if (hideFooter) return null;

  return (
    <footer
      className="w-full border-t bg-gradient-to-b from-background via-background to-muted/20 backdrop-blur-sm"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Desktop: Full footer with links */}
        <div className="hidden md:block py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">H</span>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Navigate
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/features" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Features
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Legal
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/privacy-security" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Privacy & Security
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Support
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="mailto:knsalee@gmail.com" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:support@hopementalhealthsupport.xyz" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Support Email
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Connect
                </h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/community" 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Community
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-primary/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-foreground">
                  © {new Date().getFullYear()} Hope Mental Wellness
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All rights reserved
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your privacy and security are fundamental to our mission.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: fixed bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 md:static z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-primary/10 shadow-lg">
          <div className="py-3 px-2 flex justify-around gap-2">
            <Link 
              href="/therapy" 
              className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
                pathname?.startsWith('/therapy') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                pathname?.startsWith('/therapy') 
                  ? 'bg-primary/10 scale-110' 
                  : 'group-hover:bg-primary/5 group-active:scale-95'
              }`}>
                <MessageCircle className={`w-5 h-5 transition-all duration-200 ${
                  pathname?.startsWith('/therapy') ? 'scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              <span className="text-[10px] font-medium mt-1">AI Chat</span>
            </Link>
            <Link 
              href="/meditations" 
              className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
                pathname?.startsWith('/meditations') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                pathname?.startsWith('/meditations') 
                  ? 'bg-primary/10 scale-110' 
                  : 'group-hover:bg-primary/5 group-active:scale-95'
              }`}>
                <Headphones className={`w-5 h-5 transition-all duration-200 ${
                  pathname?.startsWith('/meditations') ? 'scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              <span className="text-[10px] font-medium mt-1">Meditations</span>
            </Link>
            <Link 
              href="/journaling" 
              className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
                pathname?.startsWith('/journaling') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                pathname?.startsWith('/journaling') 
                  ? 'bg-primary/10 scale-110' 
                  : 'group-hover:bg-primary/5 group-active:scale-95'
              }`}>
                <NotebookPen className={`w-5 h-5 transition-all duration-200 ${
                  pathname?.startsWith('/journaling') ? 'scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              <span className="text-[10px] font-medium mt-1">AI Journal</span>
            </Link>
            <Link 
              href="/community" 
              className={`flex flex-col items-center group transition-all duration-200 flex-1 ${
                pathname?.startsWith('/community') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                pathname?.startsWith('/community') 
                  ? 'bg-primary/10 scale-110' 
                  : 'group-hover:bg-primary/5 group-active:scale-95'
              }`}>
                <Users className={`w-5 h-5 transition-all duration-200 ${
                  pathname?.startsWith('/community') ? 'scale-110' : 'group-hover:scale-110'
                }`} />
              </div>
              <span className="text-[10px] font-medium mt-1">Community</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
