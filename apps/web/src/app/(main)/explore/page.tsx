"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Users, Star, LayoutGrid, List, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApiClient } from "@/lib/api";
import { ProfileCard } from "@/components/ui/profile-card";

const skillFilters = ["All", "React", "TypeScript", "Python", "Go", "Rust", "DevOps", "Mobile", "AI/ML", "Design"];

function Avatar({ username, avatarUrl, size = 48 }: { username: string; avatarUrl?: string | null; size?: number }) {
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

export default function ExplorePage() {
  const authApi = useApiClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStatuses, setFollowStatuses] = useState<Record<string, 'NONE' | 'PENDING' | 'ACCEPTED'>>({});

  const searchDevs = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await authApi.get(`/users/search?q=${q}&limit=24`);
      if (res.data?.success) {
        const devs = res.data.data || [];
        setDevelopers(devs);
        // Initialize follow statuses from API response
        const statuses: Record<string, 'NONE' | 'PENDING' | 'ACCEPTED'> = {};
        devs.forEach((d: any) => {
          statuses[d.id] = d.followStatus || 'NONE';
        });
        setFollowStatuses(statuses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchDevs(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchDevs]);

  const toggleFollow = async (e: React.MouseEvent, dev: any) => {
    e.preventDefault();
    e.stopPropagation();
    const current = followStatuses[dev.id] || 'NONE';
    if (current === 'NONE') {
      // Send follow request → PENDING
      setFollowStatuses((prev) => ({ ...prev, [dev.id]: 'PENDING' }));
      try {
        await authApi.post(`/users/${dev.id}/follow`);
      } catch {
        setFollowStatuses((prev) => ({ ...prev, [dev.id]: 'NONE' }));
      }
    } else {
      // Cancel request or unfollow → NONE
      setFollowStatuses((prev) => ({ ...prev, [dev.id]: 'NONE' }));
      try {
        await authApi.delete(`/users/${dev.id}/follow`);
      } catch {
        setFollowStatuses((prev) => ({ ...prev, [dev.id]: current }));
      }
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Explore Developers</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Discover talented developers from around the world
        </p>
      </motion.div>

      {/* Search + Filters bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            id="explore-search"
            type="text"
            placeholder="Search developers by name or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 40px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 14, color: "var(--primary)", outline: "none", transition: "border-color 150ms" }}
            className="focus:border-accent/60"
          />
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: 3 }}>
          {[
            { mode: "grid" as const, Icon: LayoutGrid },
            { mode: "list" as const, Icon: List },
          ].map(({ mode, Icon }) => (
            <button
              key={mode}
              id={`view-${mode}`}
              onClick={() => setView(mode)}
              style={{ width: 32, height: 32, borderRadius: "var(--radius-full)", border: "none", background: view === mode ? "var(--primary)" : "transparent", color: view === mode ? "var(--background)" : "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms" }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Skill filter chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}
      >
        {skillFilters.map((filter) => (
          <button
            key={filter}
            id={`filter-${filter.toLowerCase()}`}
            onClick={() => setActiveFilter(filter)}
            style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", border: `1px solid ${activeFilter === filter ? "var(--accent)" : "var(--border)"}`, background: activeFilter === filter ? "var(--accent-muted)" : "var(--surface)", color: activeFilter === filter ? "var(--accent)" : "var(--secondary)", fontSize: 13, fontWeight: activeFilter === filter ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all 150ms" }}
          >
            {filter}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : developers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          No developers found.
        </div>
      ) : (
        <>
          {/* Results count */}
          <p style={{ fontSize: 13, color: "var(--secondary)", marginBottom: 16 }}>
            Showing <strong style={{ color: "var(--primary)" }}>{developers.length}</strong> developers
          </p>

          {/* Developer cards */}
          <motion.div
            style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(3, 1fr)" : "1fr", gap: 16 }}
            className={view === "grid" ? "explore-grid" : ""}
          >
            {developers.map((dev, i) => {
            if (view === "grid") {
                return (

                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <ProfileCard
                      name={dev.username}
                      title={dev.profile?.headline || dev.bio || "Product Builder & Developer"}
                      avatarUrl={dev.avatarUrl || undefined}
                      backgroundUrl={dev.coverUrl || undefined}
                      likes={dev._count?.followers || 0}
                      posts={dev._count?.projects || 0}
                      views={dev.level * 100 + (dev.streak || 0) * 10}
                      level={dev.level || 1}
                      instagramUrl={dev.socialLinks?.find((s: any) => s.platform.toLowerCase() === 'instagram')?.url}
                      twitterUrl={dev.socialLinks?.find((s: any) => s.platform.toLowerCase() === 'twitter')?.url}
                      threadsUrl={dev.socialLinks?.find((s: any) => s.platform.toLowerCase() === 'threads')?.url}
                      followStatus={followStatuses[dev.id] || 'NONE'}
                      onFollowToggle={(e) => toggleFollow(e, dev)}
                      profileUrl={`/profile/${dev.username}`}
                    />
                  </motion.div>
                );
              }

              return (
                <Link
                  key={dev.id}
                  href={`/profile/${dev.username}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="card-hover"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, height: "100%" }}
                  >
                    <Avatar username={dev.username} avatarUrl={dev.avatarUrl} size={48} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>{dev.username}</h3>
                      </div>
                      {dev.profile?.headline && (
                        <p style={{ fontSize: 13, color: "var(--secondary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {dev.profile.headline}
                        </p>
                      )}
                      {dev.profile?.location && (
                        <p style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                          <MapPin size={11} />
                          {dev.profile.location}
                        </p>
                      )}

                      {/* Stats + Follow */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                        <div style={{ display: "flex", gap: 14 }}>
                          <span style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Users size={12} />
                            {dev._count?.followers || 0}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Star size={12} />
                            {dev._count?.projects || 0} projects
                          </span>
                        </div>
                        <button
                          onClick={(e) => toggleFollow(e, dev)}
                          style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", background: (followStatuses[dev.id] && followStatuses[dev.id] !== 'NONE') ? "var(--border)" : "var(--accent)", border: "none", color: (followStatuses[dev.id] && followStatuses[dev.id] !== 'NONE') ? "var(--secondary)" : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity 150ms" }}
                          className="hover:opacity-85"
                        >
                          {followStatuses[dev.id] === 'ACCEPTED' ? 'Following' : followStatuses[dev.id] === 'PENDING' ? 'Requested' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .explore-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .explore-grid { grid-template-columns: 1fr !important; }
        }
        /* Mobile layout fixes */
        @media (max-width: 640px) {
          h1 { font-size: 20px !important; }
          .explore-search-bar { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
