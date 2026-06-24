"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Flame, ArrowRight, User, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), bio: bio.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08),_transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Flame className="size-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight">GrindForge</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground">
            Set up your profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}! Choose a
            username to start forging.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <AtSign className="size-3.5" />
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. nikhil_forge"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={20}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Letters, numbers, and underscores only. 3-20 characters.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <User className="size-3.5" />
                Bio{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What are you forging? e.g. DSA, Web Dev, GATE..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={200}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-sm font-semibold"
            >
              {loading ? (
                "Setting up..."
              ) : (
                <>
                  Start Forging
                  <ArrowRight className="ml-1.5 size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
