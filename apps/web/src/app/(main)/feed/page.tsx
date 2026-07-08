"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Image, Code, Smile, Send, TrendingUp, Users, Loader2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useApiClient } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PostUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  level: number;
}
interface Post {
  id: string;
  content: string;
  type: string;
  imageUrls: string;
  createdAt: string;
  user: PostUser;
  _count: { likes: number; comments: number };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ username, avatarUrl, size = 40 }: { username: string; avatarUrl?: string | null; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase();
  const colors = ["from-blue-500 to-violet-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-pink-500 to-rose-600", "from-amber-500 to-orange-600"];
  const color = colors[username.charCodeAt(0) % colors.length];
  if (avatarUrl) return <img src={avatarUrl} alt={username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, var(--tw-gradient-stops))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "white", flexShrink: 0 }}
      className={`bg-gradient-to-br ${color}`}>
      {initials}
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onBookmark }: { post: Post; onLike: (id: string, liked: boolean) => void; onBookmark: (id: string, bookmarked: boolean) => void }) {
  const [liked, setLiked] = useState(!!post.isLiked);
  const [likes, setLikes] = useState(post._count.likes);
  const [bookmarked, setBookmarked] = useState(!!post.isBookmarked);
  const authApi = useApiClient();

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    try {
      if (next) await authApi.post(`/feed/${post.id}/like`);
      else await authApi.delete(`/feed/${post.id}/like`);
      onLike(post.id, next);
    } catch {
      setLiked(!next);
      setLikes((l) => l + (next ? -1 : 1));
    }
  };

  const handleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      if (next) await authApi.post(`/feed/${post.id}/bookmark`);
      else await authApi.delete(`/feed/${post.id}/bookmark`);
      onBookmark(post.id, next);
    } catch {
      setBookmarked(!next);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "18px 20px", marginBottom: 16 }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar username={post.user.username} avatarUrl={post.user.avatarUrl} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{post.user.username}</span>
              {post.type === "CODE" && (
                <span style={{ fontSize: 10, fontWeight: 600, background: "rgba(37,99,235,0.1)", color: "var(--accent)", borderRadius: 4, padding: "1px 6px" }}>CODE</span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>@{post.user.username} · {formatRelativeTime(new Date(post.createdAt))}</p>
          </div>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6 }} className="hover:bg-surface-elevated">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-line" }}>{post.content}</p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
        <button id={`like-post-${post.id}`} onClick={handleLike}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--radius)", border: "none", background: liked ? "rgba(239,68,68,0.08)" : "transparent", color: liked ? "#EF4444" : "var(--secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 150ms" }}
          className="hover:bg-surface-elevated">
          <Heart size={15} fill={liked ? "#EF4444" : "none"} />{likes}
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--radius)", border: "none", background: "transparent", color: "var(--secondary)", fontSize: 13, cursor: "pointer" }} className="hover:bg-surface-elevated">
          <MessageCircle size={15} />{post._count.comments}
        </button>
        <button id={`bookmark-post-${post.id}`} onClick={handleBookmark}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--radius)", border: "none", background: bookmarked ? "var(--accent-muted)" : "transparent", color: bookmarked ? "var(--accent)" : "var(--secondary)", fontSize: 13, cursor: "pointer", transition: "all 150ms" }}
          className="hover:bg-surface-elevated">
          <Bookmark size={15} fill={bookmarked ? "var(--accent)" : "none"} />
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--radius)", border: "none", background: "transparent", color: "var(--secondary)", fontSize: 13, cursor: "pointer", marginLeft: "auto" }} className="hover:bg-surface-elevated">
          <Share2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Post Composer ────────────────────────────────────────────────────────────
function PostComposer({ onPost }: { onPost: (post: Post) => void }) {
  const { user } = useUser();
  const authApi = useApiClient();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"TEXT" | "CODE">("TEXT");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await authApi.post("/feed", { content, type: postType });
      onPost(res.data.data);
      setContent("");
    } catch (err) {
      console.error("Failed to post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Avatar username={user?.username || user?.id || "me"} avatarUrl={user?.imageUrl} size={38} />
        <div style={{ flex: 1 }}>
          <textarea
            id="post-composer"
            placeholder="What's on your mind? Share code, ideas, or ask questions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 14, color: "var(--primary)", lineHeight: 1.6, minHeight: 80, fontFamily: "inherit" }}
            rows={3}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[{ icon: Image, label: "Image", type: "TEXT" as const }, { icon: Code, label: "Code", type: "CODE" as const }, { icon: Smile, label: "Emoji", type: "TEXT" as const }].map((btn) => (
                <button key={btn.label} title={btn.label} onClick={() => setPostType(btn.type)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: postType === btn.type && btn.type === "CODE" ? "var(--accent-muted)" : "transparent", color: postType === btn.type && btn.type === "CODE" ? "var(--accent)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  className="hover:bg-surface-elevated">
                  <btn.icon size={15} />
                </button>
              ))}
            </div>
            <button id="submit-post-btn" disabled={!content.trim() || loading} onClick={handleSubmit}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: "var(--radius-full)", border: "none", background: content.trim() ? "var(--accent)" : "var(--border)", color: content.trim() ? "white" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: content.trim() ? "pointer" : "not-allowed" }}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Suggested Developers Sidebar ─────────────────────────────────────────────
function SuggestedDevs() {
  const authApi = useApiClient();
  const [devs, setDevs] = useState<any[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    authApi.get("/users/suggested").then((r) => setDevs(r.data.data || [])).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFollow = async (dev: any) => {
    const isFollowing = followed.has(dev.id);
    setFollowed((prev) => { const n = new Set(prev); isFollowing ? n.delete(dev.id) : n.add(dev.id); return n; });
    try {
      if (isFollowing) await authApi.delete(`/users/${dev.id}/follow`);
      else await authApi.post(`/users/${dev.id}/follow`);
    } catch { setFollowed((prev) => { const n = new Set(prev); isFollowing ? n.add(dev.id) : n.delete(dev.id); return n; }); }
  };

  if (devs.length === 0) return null;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
        <Users size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--accent)" }} />
        Who to Follow
      </h2>
      {devs.slice(0, 4).map((dev: any, i: number) => (
        <div key={dev.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < devs.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
          <Avatar username={dev.username} avatarUrl={dev.avatarUrl} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dev.username}</p>
          </div>
          <button onClick={() => toggleFollow(dev)}
            style={{ fontSize: 11, fontWeight: 600, color: followed.has(dev.id) ? "var(--muted)" : "var(--accent)", background: followed.has(dev.id) ? "var(--border)" : "var(--accent-muted)", border: "none", borderRadius: "var(--radius-full)", padding: "4px 10px", cursor: "pointer", flexShrink: 0 }}>
            {followed.has(dev.id) ? "Following" : "Follow"}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const authApi = useApiClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      const res = await authApi.get(`/feed?page=${p}&limit=10`);
      const { data, hasMore: more } = res.data;
      setPosts((prev) => p === 1 ? data : [...prev, ...data]);
      setHasMore(more);
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const handleNewPost = (post: Post) => setPosts((prev) => [post, ...prev]);

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }} className="feed-layout">
        {/* Main feed */}
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Community Feed
          </motion.h1>

          <PostComposer onPost={handleNewPost} />

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>No posts yet</p>
              <p style={{ fontSize: 13 }}>Be the first to share something!</p>
            </div>
          ) : (
            <>
              {posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                  <PostCard post={post} onLike={() => {}} onBookmark={() => {}} />
                </motion.div>
              ))}
              {hasMore && (
                <button onClick={() => { const next = page + 1; setPage(next); fetchPosts(next); }}
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface)", color: "var(--secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 8 }}>
                  Load more
                </button>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Trending topics */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
              <TrendingUp size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--accent)" }} />
              Trending
            </h2>
            {["#TypeScript", "#ReactServer", "#OpenSource", "#DevOps", "#WebPerf"].map((tag, i) => (
              <div key={tag} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid var(--border-subtle)" : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)" }}>{tag}</span>
              </div>
            ))}
          </div>

          <SuggestedDevs />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .feed-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
