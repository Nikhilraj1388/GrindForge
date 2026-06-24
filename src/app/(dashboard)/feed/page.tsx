"use client";

import { useState, useEffect } from "react";
import { Flame, Heart, MessageCircle, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Post = {
  id: string; content: string; createdAt: string; likesCount: number; commentsCount: number;
  userReaction: string | null;
  user: { id: string; username: string | null; fullName: string | null; profileImage: string | null };
  group: { name: string } | null;
  session: { subject: string; topic: string | null; totalDurationSeconds: number } | null;
  _count: { comments: number; reactions: number };
};
type Comment = {
  id: string; content: string; createdAt: string;
  user: { username: string | null; fullName: string | null };
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch("/api/feed?limit=30");
    if (res.ok) { const d = await res.json(); setPosts(d.posts || []); }
    setLoading(false);
  }

  async function handlePost() {
    if (!newPost.trim()) return;
    setPosting(true);
    const res = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost.trim(), visibility: "PUBLIC" }),
    });
    if (res.ok) { setNewPost(""); fetchPosts(); }
    setPosting(false);
  }

  async function handleReact(postId: string, type: string) {
    await fetch(`/api/feed/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reactionType: type }),
    });
    fetchPosts();
  }

  async function loadComments(postId: string) {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    const res = await fetch(`/api/feed/${postId}/comments`);
    if (res.ok) { const d = await res.json(); setComments(d.comments || []); }
  }

  async function submitComment(postId: string) {
    if (!commentText.trim()) return;
    await fetch(`/api/feed/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    setCommentText("");
    loadComments(postId);
    fetchPosts();
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Feed</h1>
      <p className="mt-1 text-sm text-muted-foreground">See what everyone&apos;s forging</p>

      {/* New Post */}
      <div className="mt-5 rounded-xl border border-border bg-card p-4">
        <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share your progress..." rows={2} maxLength={1000}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        <div className="mt-2 flex justify-end">
          <button onClick={handlePost} disabled={posting || !newPost.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
            <Send className="size-3.5" /> {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-5 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card" />)
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No posts yet. Be the first!</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-secondary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{post.user.fullName || post.user.username}</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)} {post.group && `· ${post.group.name}`}</p>
                </div>
              </div>

              {/* Session badge */}
              {post.session && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  <Flame className="size-4 text-primary" />
                  <div className="text-xs">
                    <span className="font-medium text-foreground">{post.session.subject}</span>
                    {post.session.topic && <span className="text-muted-foreground"> · {post.session.topic}</span>}
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary">
                    <Clock className="size-3" /> {formatDuration(post.session.totalDurationSeconds)}
                  </span>
                </div>
              )}

              <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">{post.content}</p>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
                <button onClick={() => handleReact(post.id, "LIKE")}
                  className={cn("flex items-center gap-1 text-xs transition-colors", post.userReaction ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground")}>
                  <Heart className={cn("size-3.5", post.userReaction && "fill-primary")} /> {post.likesCount}
                </button>
                <button onClick={() => handleReact(post.id, "FIRE")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Flame className="size-3.5" /> Fire
                </button>
                <button onClick={() => loadComments(post.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <MessageCircle className="size-3.5" /> {post.commentsCount}
                </button>
              </div>

              {/* Comments */}
              {openComments === post.id && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="size-6 rounded-full bg-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs"><span className="font-semibold text-foreground">{c.user.fullName || c.user.username}</span> <span className="text-muted-foreground">{c.content}</span></p>
                        <p className="text-[9px] text-muted-foreground">{timeAgo(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                      placeholder="Write a comment..." className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    <button onClick={() => submitComment(post.id)} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground">
                      <Send className="size-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
