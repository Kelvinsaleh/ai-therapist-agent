"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/contexts/session-context";

export default function AdminMeditationsPage() {
  const { user } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return <div className="p-6 text-center">Sign in required.</div>;
  }

  if (user.email !== "knsalee@gmail.com") {
    return <div className="p-6 text-center">Not authorized.</div>;
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file) {
      setError("Please select an audio file.");
      return;
    }
    try {
      setIsUploading(true);
      const form = new FormData();
      form.append("file", file);
      form.append("title", title || file.name);

      const res = await fetch("/api/meditations/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "Upload failed");
      }
      setSuccess("Uploaded successfully.");
      setFile(null);
      setTitle("");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Meditation Audio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Audio File</Label>
              <Input id="file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isUploading}>{isUploading ? "Uploading..." : "Upload"}</Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


