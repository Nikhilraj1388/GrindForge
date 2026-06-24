"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Flame, Save, User, AtSign, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUsername(data.user.username || "");
            setBio(data.user.bio || "");
            setIsPublic(data.user.isPublic ?? true);
          }
        }
      } catch {
        // silently fail, user can still edit
      }
    }
    if (isLoaded) loadProfile();
  }, [isLoaded]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setMessage({ type: "error", text: "Username is required" });
      return;
    }
    if (username.length < 3) {
      setMessage({
        type: "error",
        text: "Username must be at least 3 characters",
      });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setMessage({
        type: "error",
        text: "Username: letters, numbers, underscores only",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
          isPublic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Update failed" });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your GrindForge profile
      </p>

      {/* Profile Card */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="size-16 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-primary bg-secondary">
                <User className="size-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary">
              <Flame className="size-3 text-primary-foreground" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {user?.fullName || "Forge User"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Profile picture is managed through your Clerk account settings.
        </p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="mt-6 space-y-5">
        {/* Username */}
        <div className="rounded-xl border border-border bg-card p-5">
          <label
            htmlFor="username"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <AtSign className="size-3.5" />
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={20}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            3-20 characters. Letters, numbers, underscores.
          </p>
        </div>

        {/* Bio */}
        <div className="rounded-xl border border-border bg-card p-5">
          <label
            htmlFor="bio"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <FileText className="size-3.5" />
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others what you're forging..."
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={200}
          />
        </div>

        {/* Visibility */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">
            Profile Visibility
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isPublic
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !isPublic
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Private
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isPublic
              ? "Your profile and stats are visible to everyone."
              : "Only group members can see your profile."}
          </p>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === "success"
                ? "bg-[#22c55e]/10 text-[#22c55e]"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Save */}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-6 text-sm font-semibold"
        >
          <Save className="mr-1.5 size-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Account Actions Section */}
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-lg font-bold text-foreground">Account Actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign out of your GrindForge account</p>
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => signOut()}
            variant="destructive"
            className="h-10 px-6 text-sm font-semibold gap-1.5"
          >
            <LogOut className="size-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
