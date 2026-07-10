"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  MapPin, Globe, Mail, CalendarDays, Users,
  FolderKanban, Newspaper, Star, Edit,
  UserPlus, UserMinus, MessageSquare, Award, Flame, Loader2,
  ArrowBigUp, ArrowBigDown, Code, Trophy, Send, BookOpen,
  Compass, Shield, Zap, Sparkles, Heart, Target, GitCommit,
  GitPullRequest, ChevronDown, ChevronUp,
} from "lucide-react";
import { Github, Twitter, Linkedin } from "@/components/shared/BrandIcons";
import { useApiClient } from "@/lib/api";
import ExpLevelCard from "@/components/ui/exp-level-card";
import { EditProfileDialog } from "@/components/shared/EditProfileDialog";
import { formatNumber } from "@/lib/utils";

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
  if (lower.includes("twitter") || lower.includes("x.com")) return Twitter;
  if (lower.includes("linkedin")) return Linkedin;
  // Instagram and Threads use inline SVG icons below — return a generic icon as fallback
  return Mail;
};

// Returns inline SVG for social platforms not in lucide
const SocialIconSVG = ({ platform }: { platform: string }) => {
  const lower = platform.toLowerCase();
  if (lower.includes("instagram")) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (lower.includes("threads")) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.267-.879-2.239-.884h-.06c-.744 0-1.95.204-2.679 1.328l-1.752-1.138c.979-1.521 2.487-2.357 4.348-2.357h.084c3.118.028 4.977 1.96 5.147 5.392.083.028.165.057.249.086 1.316.47 2.272 1.234 2.844 2.271.95 1.708.982 4.088-.169 6.332C18.944 22.695 16.559 23.98 12.186 24z"/>
      </svg>
    );
  }
  // Fallback: GitHub, Twitter, LinkedIn handled by parent via getSocialIcon
  return null;
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
  const [followStatus, setFollowStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED'>('NONE');
  const [incomingFollowStatus, setIncomingFollowStatus] = useState<'NONE' | 'PENDING' | 'ACCEPTED'>('NONE');
  const isFollowing = followStatus === 'ACCEPTED';
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "posts">("projects");
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [contributions, setContributions] = useState<string[]>([]);

  useEffect(() => {
    if (!profile?.username) return;
    authApi.get(`/users/${profile.username}/contributions`)
      .then((res) => {
        if (res.data?.success) {
          setContributions(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching contributions:", err));
  }, [profile?.username]);

  const contributionsMap = contributions.reduce((acc: Record<string, number>, dateStr: string) => {
    const d = new Date(dateStr).toDateString();
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const getContributionCount = (week: number, day: number) => {
    const today = new Date();
    const cellDate = new Date();
    const daysAgo = (51 - week) * 7 + (6 - day);
    cellDate.setDate(today.getDate() - daysAgo);
    const dateStr = cellDate.toDateString();
    return contributionsMap[dateStr] || 0;
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await authApi.post("/upload?folder=devverse/covers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (uploadRes.data?.success && uploadRes.data?.url) {
        const coverUrl = uploadRes.data.url;
        const updateRes = await authApi.put("/users/me", { coverUrl });
        if (updateRes.data?.success) {
          setProfile((prev: any) => ({ ...prev, coverUrl }));
        }
      }
    } catch (err) {
      console.error("Cover upload failed:", err);
      alert("Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const achievementsList = [
    // --- Level 1: Starter Achievements ---
    {
      id: "first_commit",
      icon: <Code size={22} className="mx-auto text-blue-500" />,
      title: "First Commit",
      description: "Post your first project on DevVerse",
      earned: (profile?.projects?.length || profile?._count?.projects || 0) > 0,
    },
    {
      id: "first_words",
      icon: <MessageSquare size={22} className="mx-auto text-indigo-500" />,
      title: "First Words",
      description: "Publish your first feed post",
      earned: (profile?.posts?.length || profile?._count?.posts || 0) > 0,
    },
    {
      id: "skill_collector",
      icon: <BookOpen size={22} className="mx-auto text-emerald-500" />,
      title: "Skill Collector",
      description: "Add 3 or more skills to your profile",
      earned: (profile?.userSkills?.length || 0) >= 3,
    },
    {
      id: "rising_star",
      icon: <UserPlus size={22} className="mx-auto text-amber-500" />,
      title: "Rising Star",
      description: "Gain your first follower on DevVerse",
      earned: (profile?._count?.followers || 0) > 0,
    },
    {
      id: "networker",
      icon: <Heart size={22} className="mx-auto text-red-500" />,
      title: "Networker",
      description: "Follow at least one other developer",
      earned: (profile?._count?.following || 0) > 0,
    },
    {
      id: "streak_starter",
      icon: <Flame size={22} className="mx-auto text-orange-500" />,
      title: "Streak Starter",
      description: "Maintain a daily login streak of at least 1 day",
      earned: (profile?.streak || 0) >= 1,
    },
    {
      id: "first_mark",
      icon: <CalendarDays size={22} className="mx-auto text-cyan-500" />,
      title: "First Mark",
      description: "Register for your first community event",
      earned: (profile?.eventRegistrations?.length || profile?._count?.eventRegistrations || 0) > 0,
    },

    // --- Level 2: Intermediate Achievements ---
    {
      id: "polymath",
      icon: <Compass size={22} className="mx-auto text-teal-500" />,
      title: "Polymath",
      description: "Add 8 or more skills to your profile",
      earned: (profile?.userSkills?.length || 0) >= 8,
    },
    {
      id: "collaborator",
      icon: <Target size={22} className="mx-auto text-rose-500" />,
      title: "Collaborator",
      description: "Follow 10 or more developers on the platform",
      earned: (profile?._count?.following || 0) >= 10,
    },
    {
      id: "prolific_builder",
      icon: <FolderKanban size={22} className="mx-auto text-sky-500" />,
      title: "Prolific Builder",
      description: "Post 5 or more projects on DevVerse",
      earned: (profile?.projects?.length || profile?._count?.projects || 0) >= 5,
    },
    {
      id: "conversationalist",
      icon: <Send size={22} className="mx-auto text-purple-500" />,
      title: "Conversationalist",
      description: "Publish 5 or more feed posts",
      earned: (profile?.posts?.length || profile?._count?.posts || 0) >= 5,
    },
    {
      id: "streak_master",
      icon: <Zap size={22} className="mx-auto text-yellow-500" />,
      title: "Streak Master",
      description: "Maintain a daily contribution streak of 7 days",
      earned: (profile?.streak || 0) >= 7,
    },
    {
      id: "karma_initiate",
      icon: <Star size={22} className="mx-auto text-amber-500" />,
      title: "Karma Initiate",
      description: "Earn 100 or more Dev Karma experience points",
      earned: (profile?.totalExp || 0) >= 100,
    },
    {
      id: "influencer",
      icon: <Users size={22} className="mx-auto text-indigo-400" />,
      title: "Influencer",
      description: "Attract 10 or more followers to your profile",
      earned: (profile?._count?.followers || 0) >= 10,
    },

    // --- Level 3: Advanced/Epic Achievements ---
    {
      id: "level_5_coder",
      icon: <Award size={22} className="mx-auto text-violet-500" />,
      title: "Level 5 Coder",
      description: "Reach level 5 or above in level progression",
      earned: (profile?.level || 1) >= 5,
    },
    {
      id: "grand_architect",
      icon: <Trophy size={22} className="mx-auto text-yellow-600" />,
      title: "Grand Architect",
      description: "Post 10 or more projects on DevVerse",
      earned: (profile?.projects?.length || profile?._count?.projects || 0) >= 10,
    },
    {
      id: "thought_leader",
      icon: <Award size={22} className="mx-auto text-fuchsia-500" />,
      title: "Thought Leader",
      description: "Publish 15 or more feed posts",
      earned: (profile?.posts?.length || profile?._count?.posts || 0) >= 15,
    },
    {
      id: "unstoppable_streak",
      icon: <Sparkles size={22} className="mx-auto text-amber-400" />,
      title: "Unstoppable",
      description: "Maintain a daily contribution streak of 30 days",
      earned: (profile?.streak || 0) >= 30,
    },
    {
      id: "karma_champion",
      icon: <GitCommit size={22} className="mx-auto text-emerald-400" />,
      title: "Karma Champion",
      description: "Earn 500 or more Dev Karma experience points",
      earned: (profile?.totalExp || 0) >= 500,
    },
    {
      id: "event_enthusiast",
      icon: <Compass size={22} className="mx-auto text-cyan-400" />,
      title: "Event Enthusiast",
      description: "Register for 5 or more community events",
      earned: (profile?.eventRegistrations?.length || profile?._count?.eventRegistrations || 0) >= 5,
    },
    {
      id: "level_10_master",
      icon: <Shield size={22} className="mx-auto text-pink-500" />,
      title: "Level 10 Master",
      description: "Reach level 10 or above in level progression",
      earned: (profile?.level || 1) >= 10,
    },

    // --- Level 4: Legendary Achievements ---
    {
      id: "dev_legend",
      icon: <Shield size={22} className="mx-auto text-red-600" />,
      title: "Dev Legend",
      description: "Attract 50 or more followers to your profile",
      earned: (profile?._count?.followers || 0) >= 50,
    },
    {
      id: "karma_overlord",
      icon: <GitPullRequest size={22} className="mx-auto text-orange-600" />,
      title: "Karma Overlord",
      description: "Earn 2000 or more Dev Karma experience points",
      earned: (profile?.totalExp || 0) >= 2000,
    },
    {
      id: "level_20_transcendent",
      icon: <Sparkles size={22} className="mx-auto text-rose-600" />,
      title: "Transcendent",
      description: "Reach level 20 or above in level progression",
      earned: (profile?.level || 1) >= 20,
    }
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);

    const isTargetingMe = userLoaded && currentUser && (
      username === currentUser.username ||
      username === currentUser.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] ||
      username === currentUser.id
    );

    const fetchFallback = () => {
      authApi.get("/users/me/profile")
        .then((res2) => {
          if (res2.data?.success && res2.data?.data) {
            setProfile(res2.data.data);
            setFollowStatus('NONE');
            setIncomingFollowStatus('NONE');
          } else {
            setError("api_error");
          }
        })
        .catch(() => {
          setError("api_error");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    authApi.get(`/users/${username}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setProfile(res.data.data);
          setFollowStatus(res.data.data.followStatus || (res.data.data.isFollowing ? 'ACCEPTED' : 'NONE'));
          setIncomingFollowStatus(res.data.data.incomingFollowStatus || 'NONE');
          setLoading(false);
        } else {
          if (isTargetingMe) {
            fetchFallback();
          } else {
            setError("not_found");
            setLoading(false);
          }
        }
      })
      .catch((err: any) => {
        console.error("Profile load error:", err);
        if (isTargetingMe) {
          fetchFallback();
        } else {
          const status = err?.response?.status;
          setError(status === 404 ? "not_found" : "api_error");
          setLoading(false);
        }
      });
  }, [username, userLoaded, currentUser]);

  const handleFollowToggle = async () => {
    if (!profile || togglingFollow) return;
    setTogglingFollow(true);
    const current = followStatus;

    if (current === 'NONE') {
      setFollowStatus('PENDING');
      try {
        const res = await authApi.post(`/users/${profile.id}/follow`);
        if (res.data?.followStatus) {
          setFollowStatus(res.data.followStatus);
        }
      } catch (err) {
        console.error(err);
        setFollowStatus('NONE');
      } finally {
        setTogglingFollow(false);
      }
    } else {
      setFollowStatus('NONE');
      if (current === 'ACCEPTED') {
        setProfile((prev: any) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: Math.max(0, prev._count.followers - 1),
          },
        }));
      }
      try {
        await authApi.delete(`/users/${profile.id}/follow`);
      } catch (err) {
        console.error(err);
        setFollowStatus(current);
        if (current === 'ACCEPTED') {
          setProfile((prev: any) => ({
            ...prev,
            _count: {
              ...prev._count,
              followers: prev._count.followers + 1,
            },
          }));
        }
      } finally {
        setTogglingFollow(false);
      }
    }
  };

  const handleAcceptIncoming = async () => {
    if (!profile) return;
    try {
      await authApi.put(`/users/${profile.id}/follow/accept`);
      setIncomingFollowStatus('ACCEPTED');
      setProfile((prev: any) => ({
        ...prev,
        _count: {
          ...prev._count,
          following: (prev._count?.following || 0) + 1
        }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineIncoming = async () => {
    if (!profile) return;
    try {
      await authApi.delete(`/users/${profile.id}/follow/decline`);
      setIncomingFollowStatus('NONE');
    } catch (err) {
      console.error(err);
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
            onClick={() => window.location.reload()}
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
          background: profile.coverUrl
            ? (profile.coverUrl.startsWith("http") || profile.coverUrl.startsWith("/")
              ? `url(${profile.coverUrl}) center/cover no-repeat`
              : profile.coverUrl)
            : "linear-gradient(135deg, #1e3a5f 0%, #2d1b69 50%, #0f1923 100%)",
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
          <button
            onClick={handleCoverClick}
            disabled={uploadingCover}
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
              cursor: uploadingCover ? "not-allowed" : "pointer",
              transition: "background 150ms",
            }}
            className="hover:bg-black/60"
          >
            {uploadingCover ? (
              <>
                <Loader2 size={12} className="animate-spin" style={{ color: "white" }} />
                &nbsp;Uploading...
              </>
            ) : (
              <>
                <Edit size={12} />
                Edit cover
              </>
            )}
          </button>
        )}
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverUpload}
          accept="image/*"
          style={{ display: "none" }}
        />
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
                    background: followStatus !== 'NONE' ? "var(--border)" : "var(--accent)",
                    border: "none",
                    color: followStatus !== 'NONE' ? "var(--secondary)" : "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 150ms",
                  }}
                  className="hover:opacity-85"
                >
                  {followStatus === 'ACCEPTED' ? <UserMinus size={14} /> : <UserPlus size={14} />}
                  {followStatus === 'ACCEPTED' ? "Following" : followStatus === 'PENDING' ? "Requested" : "Follow"}
                </button>
              </>
            )}
            {isMe && (
              <EditProfileDialog
                profile={profile}
                onSuccess={(updatedUser) => {
                  setProfile((prev: any) => ({
                    ...prev,
                    ...updatedUser,
                    profile: {
                      ...prev?.profile,
                      ...updatedUser?.profile,
                    },
                    socialLinks: updatedUser?.socialLinks || prev?.socialLinks,
                    userSkills: updatedUser?.userSkills || prev?.userSkills,
                  }));
                  if (updatedUser.username && updatedUser.username !== profile.username) {
                    router.replace(`/profile/${updatedUser.username}`);
                  }
                }}
                trigger={
                  <button
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
                      cursor: "pointer",
                      transition: "background 150ms",
                    }}
                    className="hover:bg-surface"
                  >
                    <Edit size={13} />
                    Edit Profile
                  </button>
                }
              />
            )}
          </motion.div>
        </div>

        {incomingFollowStatus === 'PENDING' && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 18px",
              background: "var(--accent-muted, rgba(37,99,235,0.05))",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              marginTop: 16,
              marginBottom: 4,
              width: "100%",
              maxWidth: 450,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>
              <strong>{profile.username}</strong> wants to follow you
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleAcceptIncoming}
                style={{
                  padding: "6px 14px",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 150ms",
                }}
                className="hover:opacity-90"
              >
                Accept
              </button>
              <button
                onClick={handleDeclineIncoming}
                style={{
                  padding: "6px 14px",
                  background: "var(--surface-elevated, var(--border))",
                  color: "var(--primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 150ms",
                }}
                className="hover:opacity-90"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Name & bio */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ marginTop: 14 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{profile.username}</h1>
            {incomingFollowStatus === 'ACCEPTED' && (
              <span
                style={{
                  background: "var(--border)",
                  color: "var(--secondary)",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                Follows you
              </span>
            )}
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
                const lower = link.platform?.toLowerCase() || "";
                const isInstagram = lower.includes("instagram");
                const isThreads   = lower.includes("threads");
                const useInlineSvg = isInstagram || isThreads;
                const Icon = useInlineSvg ? null : getSocialIcon(link.platform);
                const inlineSvg = useInlineSvg ? <SocialIconSVG platform={link.platform} /> : null;
                return (
                  <a
                    key={idx}
                    href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
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
                      textDecoration: "none",
                    }}
                    className="hover:text-accent hover:border-accent/40"
                  >
                    {useInlineSvg ? inlineSvg : Icon ? <Icon size={15} /> : null}
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
                  <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
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
                    ★{" "}
                    {formatNumber(
                      profile.totalExp !== undefined
                        ? profile.totalExp
                        : ((profile?._count?.posts || 0) * 15 +
                          (profile?._count?.projects || 0) * 30 +
                          (profile?.streak || 0) * 10 +
                          (profile?.level || 1) * 50)
                    )}
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

              {/* Static EXP & Level Progression Card */}
              {(() => {
                const postsCount    = profile?._count?.posts    || profile?.posts?.length    || 0;
                const projectsCount = profile?._count?.projects || profile?.projects?.length || 0;
                const streakDays    = profile?.streak || 0;
                const currentLevel  = profile?.level  || 1;
                const totalExp      = profile.totalExp !== undefined
                  ? profile.totalExp
                  : (postsCount * 15 + projectsCount * 30 + streakDays * 10);
                return (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
                    <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      Level Progress
                    </p>
                    <ExpLevelCard
                      level={currentLevel}
                      totalExp={totalExp}
                      expIncrement={50}
                    />
                  </div>
                );
              })()}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {(showAllAchievements ? achievementsList : achievementsList.slice(0, 6)).map((ach) => (
                <div
                  key={ach.id}
                  title={ach.earned ? "Earned!" : "Locked"}
                  style={{
                    background: ach.earned ? "var(--background)" : "rgba(255,255,255,0.02)",
                    border: ach.earned ? "1px solid rgba(16,185,129,0.3)" : "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: 12,
                    textAlign: "center",
                    position: "relative",
                    opacity: ach.earned ? 1 : 0.45,
                    filter: ach.earned ? "none" : "grayscale(30%)",
                    transition: "all 200ms",
                  }}
                >
                  <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>{ach.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ach.earned ? "var(--primary)" : "var(--secondary)" }}>
                    {ach.title}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4, lineHeight: 1.3 }}>
                    {ach.description}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      fontSize: 10,
                    }}
                  >
                    {ach.earned ? "✅" : "🔒"}
                  </div>
                </div>
              ))}
            </div>
            {achievementsList.length > 6 && (
              <button
                onClick={() => setShowAllAchievements(!showAllAchievements)}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "8px 12px",
                  background: "var(--surface-elevated, var(--border))",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 150ms",
                }}
                className="hover:bg-surface hover:text-primary"
              >
                {showAllAchievements ? "Show Less" : `View All (${achievementsList.length - 6} more)`}
                {showAllAchievements ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
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
        @media (max-width: 600px) {
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
