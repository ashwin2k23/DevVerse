"use client";

import { motion, Variants } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  TrendingUp, Users, FolderKanban, Flame,
  Star, ArrowUpRight, Plus, Code2, Globe, BookOpen, Loader2
} from "lucide-react";
import Link from "next/link";
import DevPlayground from "@/components/dashboard/DevPlayground";
import { useApiClient } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function Avatar({ username, avatarUrl, size = 36 }: { username: string; avatarUrl?: string | null; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase();
  const colors = ["from-blue-500 to-violet-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-pink-500 to-rose-600"];
  const color = colors[username.charCodeAt(0) % colors.length];
  if (avatarUrl) return <img src={avatarUrl} alt={username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, var(--tw-gradient-stops))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "white", flexShrink: 0 }}
      className={`bg-gradient-to-br ${color}`}>
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const authApi = useApiClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userLoaded || !user) return;

    const loadDashboard = async () => {
      try {
        const username =
          user.username ||
          user.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] ||
          user.id;

        // Fetch all dashboard data concurrently in parallel to minimize load times
        const [profileRes, suggestedRes, projectsRes, notificationsRes] = await Promise.all([
          authApi.get("/users/me/profile").catch(() => null),
          authApi.get("/users/suggested").catch(() => null),
          authApi.get("/projects?limit=3").catch(() => null),
          authApi.get("/notifications").catch(() => null),
        ]);

        if (profileRes?.data?.success) setProfile(profileRes.data.data);
        if (suggestedRes?.data?.success) setSuggested(suggestedRes.data.data || []);
        if (projectsRes?.data?.success) setProjects(projectsRes.data.data || []);
        if (notificationsRes?.data?.success) setActivities(notificationsRes.data.data || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, userLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFollow = async (dev: any) => {
    const isFollowing = followed.has(dev.id);
    setFollowed((prev) => { const n = new Set(prev); isFollowing ? n.delete(dev.id) : n.add(dev.id); return n; });
    try {
      if (isFollowing) await authApi.delete(`/users/${dev.id}/follow`);
      else await authApi.post(`/users/${dev.id}/follow`);
    } catch { setFollowed((prev) => { const n = new Set(prev); isFollowing ? n.add(dev.id) : n.delete(dev.id); return n; }); }
  };

  if (loading || !userLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  const stats = [
    { label: "Followers", value: String(profile?._count?.followers || 0), icon: Users, color: "var(--accent)", bg: "var(--accent-muted)" },
    { label: "Projects", value: String(profile?._count?.projects || 0), icon: FolderKanban, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
    { label: "Streak", value: `${profile?.streak || 0} 🔥`, icon: Flame, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    { label: "Level", value: String(profile?.level || 1), icon: Star, color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  ];

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Good morning, {user?.firstName || user?.username || "Developer"} 👋
        </h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Here's what's happening in your network today
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
        className="grid-cols-2 sm:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            className="card-hover"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--secondary)", marginBottom: 6 }}>{stat.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{stat.value}</p>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={17} style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main content grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 24,
        }}
        className="dashboard-content"
      >
        {/* Left: Activity + Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick actions */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "New Post", icon: BookOpen, href: "/feed", color: "#2563EB" },
                { label: "Add Project", icon: FolderKanban, href: "/projects", color: "#7C3AED" },
                { label: "Find Devs", icon: Users, href: "/explore", color: "#10B981" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  id={`quick-action-${action.label.toLowerCase().replace(" ", "-")}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 8px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--primary)",
                    textDecoration: "none",
                    transition: "border-color 150ms, transform 150ms",
                    fontSize: 12,
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                  className="hover:border-accent/30 hover:-translate-y-0.5"
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${action.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <action.icon size={18} style={{ color: action.color }} />
                  </div>
                  {action.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent Activity</h2>
              <Link href="/notifications" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                View all
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {activities.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  No recent activities
                </div>
              ) : (
                activities.slice(0, 4).map((activity, i) => (
                  <div
                    key={activity.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "12px 0",
                      borderBottom: i < activities.length - 1 && i < 3 ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    <Avatar username={activity.fromUser?.username || "dev"} avatarUrl={activity.fromUser?.avatarUrl} size={36} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13 }}>
                        <strong style={{ fontWeight: 600 }}>@{activity.fromUser?.username || "dev"}</strong>{" "}
                        <span style={{ color: "var(--secondary)" }}>{activity.message}</span>
                      </p>
                      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{formatRelativeTime(new Date(activity.createdAt))}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Trending Projects */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>
                <TrendingUp size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "var(--accent)" }} />
                Trending Projects
              </h2>
              <Link href="/projects" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                Browse all
              </Link>
            </div>
            {projects.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                No projects found
              </div>
            ) : (
              projects.map((proj, i) => (
                <div
                  key={proj.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < projects.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{proj.title}</span>
                      <ArrowUpRight size={12} style={{ color: "var(--muted)" }} />
                    </div>
                    {proj.techStack && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {proj.techStack.split(",").filter(Boolean).slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            style={{
                              fontSize: 11,
                              background: "var(--surface-elevated)",
                              border: "1px solid var(--border)",
                              borderRadius: 4,
                              padding: "1px 6px",
                              color: "var(--secondary)",
                            }}
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 13 }}>
                    <Star size={13} fill="currentColor" />
                    {proj._count?.likes || 0}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* Right: Suggested Developers + Communities */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Dev Playground */}
          <DevPlayground />

          {/* Suggested Developers */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Suggested Developers</h2>
              <Link href="/explore" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                See all
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {suggested.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                  No suggested developers
                </div>
              ) : (
                suggested.slice(0, 3).map((dev, i) => (
                  <div key={dev.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar username={dev.username} avatarUrl={dev.avatarUrl} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dev.username}</p>
                    </div>
                    <button
                      onClick={() => toggleFollow(dev)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: followed.has(dev.id) ? "var(--muted)" : "var(--accent)",
                        background: followed.has(dev.id) ? "var(--border)" : "var(--accent-muted)",
                        border: "none",
                        borderRadius: "var(--radius-full)",
                        padding: "5px 12px",
                        cursor: "pointer",
                        transition: "opacity 150ms",
                        flexShrink: 0,
                      }}
                      className="hover:opacity-80"
                    >
                      {followed.has(dev.id) ? "Requested" : "Follow"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>



          {/* Profile completion */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Complete Your Profile</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--secondary)" }}>Profile Strength</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                {profile?.profile?.completionPct || 30}%
              </span>
            </div>
            <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.profile?.completionPct || 30}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, var(--accent), #7C3AED)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Add your resume", "Link GitHub account", "Add work experience"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px dashed var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: "var(--secondary)" }}>{item}</span>
                </div>
              ))}
            </div>
            <Link
              href="/edit-profile"
              style={{
                display: "block",
                marginTop: 14,
                textAlign: "center",
                background: "var(--accent)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                padding: "9px",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                transition: "opacity 150ms",
              }}
              className="hover:opacity-85"
            >
              Complete Profile
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-content {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
