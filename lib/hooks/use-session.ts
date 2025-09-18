import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import multer from 'multer';
import { put } from '@vercel/blob';

interface User {
  _id: string;
  name: string;
  email: string;
}

const upload = multer({ dest: 'uploads/' });

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("useSession: Initial check");
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");
      console.log(
        "useSession: Token from localStorage:",
        token ? "exists" : "not found"
      );

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("useSession: Fetching user data...");
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("useSession: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("useSession: User data received:", data);
        const userData = data.user;
        const { password, ...safeUserData } = userData;
        setUser(safeUserData);
        console.log("useSession: User state updated:", safeUserData);
      } else {
        console.log("useSession: Failed to get user data");
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("useSession: Error checking session:", error);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Best-effort: clear local tokens locally to avoid 404 on missing route
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      setUser(null);
      router.push("/");
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    checkSession,
  };
}
