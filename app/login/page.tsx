"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting login...");
      
      // Use the session context login method
      const success = await login(email, password);
      
      if (success) {
        toast.success("Welcome back! Redirecting to AI Chat...");
        
        // Wait a moment for state to update, then redirect to AI chat
        setTimeout(() => {
          router.push("/therapy");
        }, 1000);
      } else {
        setError("Invalid email or password. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      
      // Provide more helpful error messages
      if (errorMessage.includes("timeout") || errorMessage.includes("Cannot connect")) {
        setError("Server is currently unavailable. Please try again in a few minutes.");
      } else if (errorMessage.includes("Invalid email or password")) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError(errorMessage);
      }
      
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting demo login...");
      
      // Try demo credentials first
      const success = await login("demo@hope.ai", "demo123");
      
      if (success) {
        toast.success("Welcome! Demo login successful. Redirecting to AI Chat...");
        setTimeout(() => {
          router.push("/therapy");
        }, 1000);
      } else {
        // If demo fails, try with premium bypass email
        const premiumSuccess = await login("knsalee@gmail.com", "demo123");
        
        if (premiumSuccess) {
          toast.success("Welcome! Premium demo login successful. Redirecting to AI Chat...");
          setTimeout(() => {
            router.push("/therapy");
          }, 1000);
        } else {
          setError("Demo login failed. Please try registering a new account or check if the server is running.");
          toast.error("Demo login failed. Please try registering a new account.");
        }
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setError("Demo login failed. Please try registering a new account or check if the server is running.");
      toast.error("Demo login failed. Please try registering a new account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/30">
      <Container className="flex flex-col items-center justify-center w-full">
        <Card className="w-full md:w-5/12 max-w-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-primary/10 bg-card/90 backdrop-blur-lg mt-12">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1 tracking-tight">
              Sign In
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Welcome back! Please sign in to continue your journey.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-semibold mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-12 py-2 text-base rounded-xl bg-card bg-opacity-80 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-muted-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-semibold mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-12 py-2 text-base rounded-xl bg-card bg-opacity-80 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-muted-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-base text-center font-medium">
                {error}
              </p>
            )}
            <Button
              className="w-full py-2 text-base rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-md hover:from-primary/80 hover:to-primary"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <div className="text-center">
              <span className="text-muted-foreground text-sm">or</span>
            </div>
            
            <Button
              className="w-full py-2 text-base rounded-xl font-bold bg-gradient-to-r from-secondary to-secondary/80 shadow-md hover:from-secondary/80 hover:to-secondary"
              size="lg"
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Demo Login...
                </>
              ) : (
                "Try Demo Account"
              )}
            </Button>
          </form>
          <div className="my-6 border-t border-primary/10" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>
              <Link
                href="/signup"
                className="text-primary font-semibold underline hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="/forgot-password"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">
                <strong>Demo Credentials:</strong><br/>
                Email: demo@hope.ai | Password: demo123<br/>
                <strong>Premium Demo:</strong><br/>
                Email: knsalee@gmail.com | Password: demo123
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
