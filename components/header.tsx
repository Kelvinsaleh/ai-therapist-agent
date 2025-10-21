"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  MessageCircle,
  AudioWaveform,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useSession } from "@/lib/contexts/session-context";

export function Header() {
  const { isAuthenticated, logout, user } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Hide header on individual therapy chat pages (but show on sessions list)
  const hideHeader = 
    (pathname?.startsWith('/therapy/') && pathname !== '/therapy' && !pathname?.includes('/sessions')) ||
    pathname === '/matching/chat';
  
  if (hideHeader) return null;

  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/matching", label: "Find Support" },
    { href: "/about", label: "About HOPE" },
  ];

  return (
    <div className="w-full fixed top-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="absolute inset-0 border-b border-primary/10" />
      <header 
        id="main-navigation"
        className="relative max-w-6xl mx-auto px-4"
        role="banner"
      >
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <AudioWaveform className="h-7 w-7 text-primary animate-pulse-gentle" />
            <div className="flex flex-col">
              <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                HOPE AI
              </span>
              <span className="text-xs dark:text-muted-foreground">
                Your mental health Companion{" "}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <nav 
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {isAuthenticated ? (
                <>
                  {user?.email === "knsalee@gmail.com" && (
                    <Button asChild variant="outline" className="hidden md:flex">
                      <Link href="/admin/meditations">Admin</Link>
                    </Button>
                  )}
                  <Button
                    asChild
                    className="hidden md:flex gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Link href="/therapy/memory-enhanced">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Start Chat
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm md:hidden z-[90]"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu content */}
            <div 
              id="mobile-navigation"
              className="md:hidden border-t border-primary/10 bg-background/98 backdrop-blur-sm relative z-[95]"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col space-y-1 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Button
                      asChild
                      className="mt-2 mx-4 gap-2 bg-primary/90 hover:bg-primary"
                    >
                      <Link href="/therapy/memory-enhanced" onClick={() => setIsMenuOpen(false)}>
                        <MessageCircle className="w-4 h-4" />
                        <span>Start Chat</span>
                      </Link>
                    </Button>
                    {user?.email === "knsalee@gmail.com" && (
                      <Link
                        href="/admin/meditations"
                        className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="mt-2 mx-4 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </>
                )}
                {!isAuthenticated && (
                  <div className="px-4 py-2">
                    <SignInButton />
                  </div>
                )}
              </nav>
            </div>
          </>
        )}
      </header>
    </div>
  );
}