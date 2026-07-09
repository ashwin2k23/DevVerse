"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  MapPin, Globe, Mail, CalendarDays, Users,
  FolderKanban, Newspaper, Star, Edit,
  UserPlus, UserMinus, MessageSquare, Award, Flame, Loader2,
  ArrowBigUp, ArrowBigDown,
} from "lucide-react";
import { Github, Twitter, Linkedin } from "@/components/shared/BrandIcons";
import { useApiClient } from "@/lib/api";

interface ProfilePageProps {
  username: string;
}

const skillLevelColor: Record<string, string> = {
  Expert: "#2563EB",
  Advanced: "#7C3AED",
  Intermediate: "#10B981",
  Beginner: "#F59E0B",
};

const getProficiencyLabel = (level: string) => {
  const map: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    EXPERT: "Expert"
  };
  return map[level] || level;
};

const formatPeriod = (start: string, end: string | null, current: boolean) => {
  try {
    const startYear = new Date(start).getFullYear();
    if (current) return `${startYear} — Present`;
    const endYear = end ? new Date(end).getFullYear() : "Present";
    return `${startYear} — ${endYear}`;
  } catch {
    return "";
  }
};

const getSocialIcon = (platform: string) => {
  const lower = platform.toLowerCase();
  if (lower.includes("github")) return Github;
  if (lower.includes("twitter")) return Twitter;
  if (lower.includes("linkedin")) return Linkedin;
  return Mail;
};

// Default achievements if database has none yet
const defaultAchievements = [
  { icon: "🏆", title: "Top Contributor", description: "Top 1% contributor" },
  { icon: "🔥", title: "Streak Master", description: "30-day streak" },
  { icon: "⭐", title: "Rising Star", description: "1K followers in 30 days" },
  { icon: "🚀", title: "Project Launch", description: "Project with 1K+ stars" },
];

function ProfilePostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [likes, setLikes] = useState(post._count?.likes || 0);
  const authApi = useApiClient();

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((l: number) => l + (next ? (downvoted ? 2 : 1) : -1));
    if (downvoted) setDownvoted(false);
    try {
      if (next) await authApi.post(`/feed/${post.id}/like`);
      else await authApi.delete(`/feed/${post.id}/like`);
    } catch {
      setLiked(!next);
      setLikes((l: number) => l + (next ? -1 : (downvoted ? -2 : -1)));
    }
  };

  const handleDownvote = () => {
    if (downvoted) {
      setDownvoted(false);
      setLikes((l: number) => l + 1);
    } else {
      setDownvoted(true);
      setLikes((l: number) => l - (liked ? 2 : 1));
      if (liked) {
        setLiked(false);
        authApi.delete(`/feed/${post.id}/like`).catch(() => {});
      }
    }
  };

  const formattedTime = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "recently";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      {/* Reddit upvote/downvote bar */}
      <div
        style={{
          width: 44,
          background: "rgba(0,0,0,0.015)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 4px",
          borderRight: "1px solid var(--border-subtle)",
          gap: 4,
        }}
        className="dark:bg-white/5"
      >
        <button
          onClick={handleLike}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: liked ? "#FF4500" : "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 4,
            transition: "background 150ms",
          }}
          className="hover:bg-surface-elevated"
          title="Upvote"
        >
          <ArrowBigUp size={22} fill={liked ? "#FF4500" : "none"} strokeWidth={1.5} />
        </button>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: liked ? "#FF4500" : downvoted ? "#7193FF" : "var(--primary)",
            minWidth: 20,
            textAlign: "center",
          }}
        >
          {likes}
        </span>

        <button
          onClick={handleDownvote}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: downvoted ? "#7193FF" : "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 4,
            transition: "background 150ms",
          }}
          className="hover:bg-surface-elevated"
          title="Downvote"
        >
          <ArrowBigDown size={22} fill={downvoted ? "#7193FF" : "none"} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main card content */}
      <div style={{ flex: 1, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 6, fontSize: 11, color: "var(--muted)", marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: "var(--accent)" }}>
            r/{post.type === "CODE" ? "typescript" : "programming"}
          </span>
          <span>·</span>
          <span>Posted by u/{post.user?.username || "developer"}</span>
          <span>·</span>
          <span>{formattedTime}</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--primary)", whiteSpace: "pre-line" }}>
          {post.content}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage({ username }: ProfilePageProps) {
  const { user: currentUser, isLoaded: userLoaded } = useUser();
  const authApi = useApiClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "posts">("projects");

  useEffect(() => {
    setLoading(true);
    setError(null);
    authApi.get(`/users/${username}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setProfile(res.data.data);
          setIsFollowing(!!res.data.data.isFollowing);
        } else {
          setError("not_found");
        }
      })
      .catch((err: any) => {
        console.error("Profile load error:", err);
        // Network error (API unreachable) vs 404 (user doesn't exist)
        const status = err?.response?.status;
        setError(status === 404 ? "not_found" : "api_error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFollowToggle = async () => {
    if (!profile || togglingFollow) return;
    setTogglingFollow(true);
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setProfile((prev: any) => ({
      ...prev,
      _count: {
        ...prev._count,
        followers: prev._count.followers + (nextState ? 1 : -1),
      },
    }));

    try {
      if (nextState) {
        await authApi.post(`/users/${profile.id}/follow`);
      } else {
        await authApi.delete(`/users/${profile.id}/follow`);
      }
    } catch (err) {
      console.error(err);
      // Revert state
      setIsFollowing(!nextState);
      setProfile((prev: any) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (nextState ? -1 : 1),
        },
      }));
    } finally {
      setTogglingFollow(false);
    }
  };

  const handleMessageClick = async () => {
    if (!profile) return;
    try {
      const res = await authApi.post("/messages/conversations", { participantId: profile.id });
      if (res.data?.success && res.data?.data?.id) {
        router.push(`/messages`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error || !profile) {
    const isApiError = error === "api_error";
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{isApiError ? "🔌" : "👤"}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--primary)" }}>
          {isApiError ? "Cannot reach the server" : "Profile Not Found"}
        </h2>
        <p style={{ color: "var(--secondary)", marginBottom: 8, maxWidth: 380, margin: "0 auto 16px" }}>
          {isApiError
            ? "The API is temporarily unavailable. Please wait a moment and try again."
            : `No developer with username "${username}" exists yet. They may need to log in to create their profile.`
          }
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => { setError(null); setLoading(true); authApi.get(`/users/${username}`).then(r => { if (r.data?.success) setProfile(r.data.data); else setError("not_found"); }).catch(() => setError("api_error")).finally(() => setLoading(false)); }}
            style={{ padding: "8px 20px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--primary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            🔄 Retry
          </button>
          <Link href="/explore" style={{ padding: "8px 20px", borderRadius: "var(--radius-full)", border: "none", background: "var(--accent)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Search Developers
          </Link>
          <Link href="/dashboard" style={{ color: "var(--accent)", fontWeight: 600, display: "inline-flex", alignItems: "center", padding: "8px 4px", fontSize: 13 }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const localCurrentUsername =
    currentUser?.username ||
    currentUser?.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] ||
    currentUser?.id;

  const isMe = userLoaded && (
    currentUser?.username === profile.username ||
    localCurrentUsername === profile.username ||
    currentUser?.id === profile.clerkId
  );
  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div style={{ paddingTop: 0, paddingBottom: 40 }}>
      {/* Cover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          height: 220,
          borderRadius: "var(--radius-lg)",
          background: profile.coverUrl || "linear-gradient(135deg, #1e3a5f 0%, #2d1b69 50%, #0f1923 100%)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.03) 0%, transparent 50%)",
          }}
        />
        {isMe && (
          <Link
            href="/edit-profile"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: "7px 14px",
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
              textDecoration: "none",
            }}
          >
            <Edit size={12} />
            Edit cover
          </Link>
        )}
      </motion.div>

      {/* Profile info section */}
      <div style={{ position: "relative", paddingTop: 0, marginTop: -60, padding: "0 0 0 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid var(--background)",
              background: "var(--surface)",
              flexShrink: 0,
            }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white" }}>
                {profile.username.slice(0, 2).toUpperCase()}
              </div>
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ display: "flex", gap: 10, marginBottom: 4 }}
          >
            {!isMe && (
              <>
                <button
                  onClick={handleMessageClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--primary)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 150ms",
                  }}
                  className="hover:bg-surface"
                >
                  <MessageSquare size={14} />
                  Message
                </button>
                <button
                  onClick={handleFollowToggle}
                  disabled={togglingFollow}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: "var(--radius-full)",
                    background: isFollowing ? "var(--border)" : "var(--accent)",
                    border: "none",
                    color: isFollowing ? "var(--secondary)" : "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 150ms",
                  }}
                  className="hover:opacity-85"
                >
                  {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </>
            )}
            {isMe && (
              <Link
                href="/edit-profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "background 150ms",
                }}
                className="hover:bg-surface"
              >
                <Edit size={13} />
                Edit Profile
              </Link>
            )}
          </motion.div>
        </div>

        {/* Name & bio */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ marginTop: 14 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{profile.username}</h1>
            <span
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
              }}
            >
              Level {profile.level}
            </span>
            <span
              style={{
                background: "rgba(245,158,11,0.15)",
                color: "#F59E0B",
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Flame size={11} />
              {profile.streak} day streak
            </span>
          </div>
          <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 2 }}>@{profile.username}</p>
          {profile.profile?.headline && (
            <p style={{ fontSize: 14, color: "var(--secondary)", marginTop: 4, fontWeight: 500 }}>
              {profile.profile.headline}
            </p>
          )}
          {profile.bio && (
            <p style={{ fontSize: 14, color: "var(--primary)", marginTop: 8, maxWidth: 600, lineHeight: 1.6 }}>
              {profile.bio}
            </p>
          )}

          {/* Meta info */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
            {profile.profile?.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--secondary)", fontSize: 13 }}>
                <MapPin size={13} />
                {profile.profile.location}
              </div>
            )}
            {profile.profile?.website && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--secondary)", fontSize: 13 }}>
                <Globe size={13} />
                <a href={profile.profile.website.startsWith("http") ? profile.profile.website : `https://${profile.profile.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }} className="hover:underline">
                  {profile.profile.website}
                </a>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--secondary)", fontSize: 13 }}>
              <CalendarDays size={13} />
              Joined {joinDate}
            </div>
          </div>

          {/* Social links */}
          {profile.socialLinks && profile.socialLinks.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {profile.socialLinks.map((link: any, idx: number) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--secondary)",
                      transition: "color 150ms, border-color 150ms",
                    }}
                    className="hover:text-accent hover:border-accent/40"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Follower stats */}
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            {[
              { label: "Followers", value: profile._count?.followers || 0 },
              { label: "Following", value: profile._count?.following || 0 },
              { label: "Projects", value: profile._count?.projects || 0 },
              { label: "Posts", value: profile._count?.posts || 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ textAlign: "left", padding: 0 }}
              >
                <span style={{ fontSize: 15, fontWeight: 700 }}>{stat.value.toLocaleString()}</span>{" "}
                <span style={{ fontSize: 13, color: "var(--secondary)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Tab Switcher */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        marginTop: 28,
        gap: 24,
      }}>
        <button
          onClick={() => setActiveTab("projects")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "projects" ? "3px solid var(--accent)" : "3px solid transparent",
            color: activeTab === "projects" ? "var(--primary)" : "var(--muted)",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms",
          }}
        >
          <FolderKanban size={15} />
          Projects & Stats
        </button>

        <button
          onClick={() => setActiveTab("posts")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "posts" ? "3px solid var(--accent)" : "3px solid transparent",
            color: activeTab === "posts" ? "var(--primary)" : "var(--muted)",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms",
          }}
        >
          <Newspaper size={15} />
          Posts ({profile.posts?.length || 0})
        </button>
      </div>

      {/* Main content grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 24,
          marginTop: 24,
        }}
        className="profile-grid"
      >
        {/* Left column — Projects, Activity */}
        <div>
          {activeTab === "projects" ? (
            <>
              {/* Projects */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginBottom: 28 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                    <FolderKanban size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--accent)" }} />
                    Projects
                  </h2>
                </div>
                {profile.projects && profile.projects.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                    {profile.projects.map((proj: any, i: number) => {
                      const colors = ["from-blue-500 to-violet-600", "from-emerald-500 to-teal-600", "from-orange-500 to-red-600"];
                      const grad = colors[i % colors.length];
                      return (
                        <motion.div
                          key={proj.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.08 }}
                          className="card-hover"
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            overflow: "hidden",
                          }}
                        >
                          {/* Project banner */}
                          <div
                            style={{
                              height: 80,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 24,
                              fontWeight: 800,
                              color: "rgba(255,255,255,0.6)",
                              letterSpacing: "-0.02em",
                            }}
                            className={`bg-gradient-to-br ${grad}`}
                          >
                            {proj.title.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ padding: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <h3 style={{ fontSize: 14, fontWeight: 700 }}>{proj.title}</h3>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 12 }}>
                                <Star size={12} fill="currentColor" />
                                {proj._count?.likes || 0}
                              </div>
                            </div>
                            <p style={{ fontSize: 12, color: "var(--secondary)", marginTop: 4, lineHeight: 1.5 }}>
                              {proj.description}
                            </p>
                            {proj.techStack && (
                              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                                {proj.techStack.split(",").filter(Boolean).map((t: string) => (
                                  <span
                                    key={t}
                                    style={{
                                      fontSize: 10,
                                      background: "var(--surface-elevated)",
                                      border: "1px solid var(--border)",
                                      borderRadius: 4,
                                      padding: "2px 7px",
                                      color: "var(--secondary)",
                                    }}
                                  >
                                    {t.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "30px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                    No projects posted yet.
                  </div>
                )}
              </motion.section>

              {/* Activity heatmap */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: 20,
                }}
              >
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  <Newspaper size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--accent)" }} />
                  Contributions in the last year
                </h2>
                {/* Activity grid */}
                <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 8 }}>
                  {Array.from({ length: 52 }).map((_, week) => (
                    <div key={week} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {Array.from({ length: 7 }).map((_, day) => {
                        const intensity = Math.random();
                        return (
                          <div
                            key={day}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background:
                                intensity > 0.8
                                  ? "var(--accent)"
                                  : intensity > 0.6
                                  ? "rgba(37,99,235,0.5)"
                                  : intensity > 0.4
                                  ? "rgba(37,99,235,0.25)"
                                  : intensity > 0.2
                                  ? "rgba(37,99,235,0.1)"
                                  : "var(--border)",
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.section>
            </>
          ) : (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                  <Newspaper size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--accent)" }} />
                  Recent Posts
                </h2>
              </div>
              {profile.posts && profile.posts.length > 0 ? (
                profile.posts.map((post: any) => (
                  <ProfilePostCard key={post.id} post={post} />
                ))
              ) : (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "40px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No posts published yet.
                </div>
              )}
            </motion.section>
          )}
        </div>

        {/* Right column — Skills, Experience, Achievements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Reddit-style About User Sidebar Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            {/* Banner style top */}
            <div style={{
              height: 48,
              background: "linear-gradient(90deg, var(--accent) 0%, #7C3AED 100%)",
            }} />
            <div style={{ padding: "0 16px 16px 16px", marginTop: -24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "3px solid var(--background)",
                  overflow: "hidden",
                  background: "var(--surface)",
                }}>
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white" }}>
                      {profile.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1, color: "var(--primary)" }}>u/{profile.username}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <div>
                  <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Dev Karma</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Star size={13} fill="currentColor" />
                    {profile.level * 100 + (profile.streak || 0) * 10}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cake Day</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--secondary)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <CalendarDays size={13} />
                    {joinDate.split(" ").slice(-2).join(" ") || "unknown"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Skills</h2>
            {profile.userSkills && profile.userSkills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.userSkills.map((us: any) => {
                  const label = getProficiencyLabel(us.proficiency);
                  const color = skillLevelColor[label] || "#2563EB";
                  return (
                    <span
                      key={us.skill.id}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "5px 10px",
                        borderRadius: "var(--radius-full)",
                        border: `1px solid ${color}40`,
                        color: color,
                        background: `${color}10`,
                      }}
                    >
                      {us.skill.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>No skills added.</div>
            )}
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Experience</h2>
            {profile.experience && profile.experience.length > 0 ? (
              profile.experience.map((exp: any, i: number) => (
                <div
                  key={exp.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    paddingBottom: i < profile.experience.length - 1 ? 14 : 0,
                    marginBottom: i < profile.experience.length - 1 ? 14 : 0,
                    borderBottom: i < profile.experience.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "var(--surface-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {exp.company[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{exp.role}</p>
                    <p style={{ fontSize: 12, color: "var(--secondary)" }}>
                      {exp.company}
                      {exp.isCurrent && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10,
                            background: "rgba(16,185,129,0.1)",
                            color: "#10B981",
                            borderRadius: 4,
                            padding: "1px 6px",
                            fontWeight: 600,
                          }}
                        >
                          Current
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>No experience history.</div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              <Award size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "#F59E0B" }} />
              Achievements
            </h2>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {profile.achievements.map((ach: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{ach.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{ach.title}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{ach.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                No achievements earned yet.
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
