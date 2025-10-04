"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/contexts/session-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Crown, 
  Plus, 
  Trash2, 
  Shield, 
  Users,
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { LoadingDotsSmall } from "@/components/ui/loading-dots";
import { toast } from "sonner";
import { 
  getPremiumBypassEmails, 
  addPremiumBypassEmail, 
  removePremiumBypassEmail,
  isPremiumBypassEmail 
} from "@/lib/utils/premium-bypass";

export default function PremiumBypassPage() {
  const { user, isAuthenticated } = useSession();
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user has admin access (knsalee@gmail.com)
  const isAdmin = user?.email === "knsalee@gmail.com";

  useEffect(() => {
    if (isAdmin) {
      setEmails(getPremiumBypassEmails());
    }
  }, [isAdmin]);

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!isValidEmail(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = addPremiumBypassEmail(newEmail);
      if (success) {
        setEmails(getPremiumBypassEmails());
        setNewEmail("");
        toast.success(`Premium bypass added for ${newEmail}`);
      } else {
        toast.error("Email already has premium bypass");
      }
    } catch (error) {
      toast.error("Failed to add premium bypass");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const success = removePremiumBypassEmail(email);
      if (success) {
        setEmails(getPremiumBypassEmails());
        toast.success(`Premium bypass removed for ${email}`);
      } else {
        toast.error("Failed to remove premium bypass");
      }
    } catch (error) {
      toast.error("Failed to remove premium bypass");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access the premium bypass management.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-8 h-8 text-primary" />
              Premium Bypass Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage email addresses with premium access bypass
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Current User Status */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Current User</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="mt-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium Bypass Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Premium Bypass Email
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Add a new email address to the premium bypass list
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddEmail}
                disabled={isLoading || !newEmail.trim()}
              >
                {isLoading ? <LoadingDotsSmall text="Adding..." /> : "Add Email"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Bypass Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Premium Bypass Emails ({emails.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Email addresses with automatic premium access
            </p>
          </CardHeader>
          <CardContent>
            {emails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No premium bypass emails configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">{email}</p>
                        <p className="text-sm text-muted-foreground">Premium access active</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              How Premium Bypass Works
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Email addresses in this list automatically get premium access</li>
              <li>• No payment or subscription required for bypassed emails</li>
              <li>• Bypass is checked during login, registration, and session refresh</li>
              <li>• Changes take effect immediately for new sessions</li>
              <li>• Use this feature responsibly for testing and admin access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}