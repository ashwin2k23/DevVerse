"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FolderKanban, Newspaper, Calendar, Star, MapPin, Loader2, ExternalLink } from "lucide-react";
import { Github } from "@/components/shared/BrandIcons";
import Link from "next/link";
import { useApiClient } from "@/lib/api";

function Avatar({ username, avatarUrl, size = 36 }: { username: string; avatarUrl?: string | null; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase();
  const colors = ["from-blue-500 to-violet-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-pink-500 to-rose-600"];
  const color = colors[username.charCodeAt(0) % colors.length];
  if (avatarUrl) return <img src={avatarUrl} alt={username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "white" }} className={`bg-gradient-to-br ${color}`}>{initials}</div>
  );
}

export default function BookmarksPage() {
  const authApi = useApiClient();
  const [activeTab, setActiveTab] = useState<"projects" | "posts" | "events" >("projects");
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    authApi.get("/users/me/bookmarks")
      .then((res) => {
        if (res.data?.success) {
          setBookmarks(res.data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bookmarkedProjects = bookmarks.filter((b) => b.targetType === "PROJECT" && b.project).map((b) => b.project);
  const bookmarkedPosts = bookmarks.filter((b) => b.targetType === "POST" && b.post).map((b) => b.post);
  const bookmarkedEvents = bookmarks.filter((b) => b.targetType === "EVENT" && b.event).map((b) => b.event);

  const removeBookmark = async (targetType: string, id: string) => {
    setBookmarks((prev) => prev.filter((b) => {
      if (targetType === "PROJECT") return b.projectId !== id;
      if (targetType === "POST") return b.postId !== id;
      return b.eventId !== id;
    }));
    try {
      if (targetType === "PROJECT") await authApi.delete(`/projects/${id}/bookmark`);
      else if (targetType === "POST") await authApi.delete(`/feed/${id}/bookmark`);
      else await authApi.delete(`/events/${id}/bookmark`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Bookmarks</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Access your saved posts, projects, and events
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: 20, marginBottom: 24 }}>
        {[
          { id: "projects" as const, label: "Projects", icon: FolderKanban },
          { id: "posts" as const, label: "Posts", icon: Newspaper },
          { id: "events" as const, label: "Events", icon: Calendar },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`bookmark-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 14px", border: "none", background: "transparent", color: isActive ? "var(--accent)" : "var(--secondary)", fontSize: 14, fontWeight: isActive ? 600 : 400, cursor: "pointer", position: "relative" }}
            >
              <tab.icon size={16} />
              {tab.label}
              {isActive && (
                <motion.div layoutId="active-bookmark-tab" style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "var(--accent)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Bookmarks Grid / List */}
      <div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : (
          <>
            {activeTab === "projects" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="bookmarks-grid">
                {bookmarkedProjects.length === 0 ? (
                  <div style={{ gridColumn: "span 2", textAlign: "center", padding: 40, color: "var(--muted)" }}>No saved projects yet.</div>
                ) : (
                  bookmarkedProjects.map((project, i) => {
                    const colors = ["from-blue-600 to-violet-700", "from-emerald-500 to-teal-600", "from-orange-500 to-red-600"];
                    const color = colors[i % colors.length];
                    return (
                      <div key={project.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ height: 100, display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.3)", justifyContent: "center" }} className={`bg-gradient-to-br ${color}`}>
                          {project.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{project.title}</h3>
                          <p style={{ fontSize: 12, color: "var(--secondary)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                            {project.description}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 12 }}>
                              <span style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                <Star size={12} fill="currentColor" />
                                {project._count?.likes || 0}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }} className="hover:text-primary">
                                  <Github size={13} />
                                </a>
                              )}
                              {project.demoUrl && (
                                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }} className="hover:text-accent">
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              <button onClick={() => removeBookmark("PROJECT", project.id)} style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--border)", border: "none", color: "var(--secondary)", fontSize: 11, cursor: "pointer" }}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {bookmarkedPosts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No saved posts yet.</div>
                ) : (
                  bookmarkedPosts.map((post) => (
                    <div key={post.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <Avatar username={post.user?.username || "dev"} avatarUrl={post.user?.avatarUrl} size={36} />
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{post.user?.username}</span>
                            <p style={{ fontSize: 11, color: "var(--muted)" }}>@{post.user?.username}</p>
                          </div>
                        </div>
                        <button onClick={() => removeBookmark("POST", post.id)} style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--border)", border: "none", color: "var(--secondary)", fontSize: 11, cursor: "pointer" }}>
                          Remove
                        </button>
                      </div>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-line" }}>{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="bookmarks-grid">
                {bookmarkedEvents.length === 0 ? (
                  <div style={{ gridColumn: "span 2", textAlign: "center", padding: 40, color: "var(--muted)" }}>No saved events yet.</div>
                ) : (
                  bookmarkedEvents.map((event, i) => {
                    const colors = ["from-blue-600 to-violet-700", "from-emerald-500 to-teal-600", "from-orange-500 to-red-600"];
                    const color = colors[i % colors.length];
                    return (
                      <div key={event.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <div style={{ height: 90, display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.3)", justifyContent: "center" }} className={`bg-gradient-to-br ${color}`}>
                          {event.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ padding: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 7px", color: "var(--secondary)" }}>
                              {event.type}
                            </span>
                            <button onClick={() => removeBookmark("EVENT", event.id)} style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--border)", border: "none", color: "var(--secondary)", fontSize: 10, cursor: "pointer" }}>
                              Remove
                            </button>
                          </div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{event.title}</h3>
                          {event.location && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                              <MapPin size={11} />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .bookmarks-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
