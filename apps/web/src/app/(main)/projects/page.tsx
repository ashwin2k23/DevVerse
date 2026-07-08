"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Search, ExternalLink, Plus, Star, Eye, Loader2 } from "lucide-react";
import { Github } from "@/components/shared/BrandIcons";
import Link from "next/link";
import { useApiClient } from "@/lib/api";

const sortOptions = ["Trending", "Most Stars", "Most Recent"];

function Avatar({ username, avatarUrl, size = 20 }: { username: string; avatarUrl?: string | null; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase();
  const colors = ["from-blue-500 to-violet-600", "from-orange-500 to-red-600", "from-emerald-500 to-teal-600", "from-pink-500 to-rose-600"];
  const color = colors[username.charCodeAt(0) % colors.length];
  if (avatarUrl) return <img src={avatarUrl} alt={username} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "white" }} className={`bg-gradient-to-br ${color}`}>{initials}</div>
  );
}

export default function ProjectsPage() {
  const authApi = useApiClient();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Trending");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchProjects = useCallback(async (q = "", s = "Trending") => {
    setLoading(true);
    try {
      const res = await authApi.get(`/projects?q=${q}&sort=${s}`);
      if (res.data?.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProjects(search, sort);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, sort, fetchProjects]);

  const toggleSave = async (projectId: string) => {
    const isSaved = savedIds.has(projectId);
    setSavedIds((prev) => { const n = new Set(prev); isSaved ? n.delete(projectId) : n.add(projectId); return n; });
    try {
      if (isSaved) await authApi.delete(`/projects/${projectId}/bookmark`);
      else await authApi.post(`/projects/${projectId}/bookmark`);
    } catch { setSavedIds((prev) => { const n = new Set(prev); isSaved ? n.add(projectId) : n.delete(projectId); return n; }); }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Projects</h1>
            <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
              Discover and showcase amazing developer projects
            </p>
          </div>
          <Link
            href="/projects/new"
            id="new-project-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "var(--accent)", color: "white", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "opacity 150ms" }}
            className="hover:opacity-85"
          >
            <Plus size={15} />
            New Project
          </Link>
        </div>
      </motion.div>

      {/* Search + Sort */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            id="projects-search"
            type="text"
            placeholder="Search projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 40px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 14, color: "var(--primary)", outline: "none" }}
            className="focus:border-accent/60"
          />
        </div>
        <select
          id="projects-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: "10px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 13, color: "var(--secondary)", outline: "none", cursor: "pointer" }}
        >
          {sortOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          No projects found.
        </div>
      ) : (
        /* Project grid */
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
          className="projects-grid"
        >
          {projects.map((project, i) => {
            const colors = ["from-blue-600 to-violet-700", "from-emerald-500 to-teal-600", "from-orange-500 to-red-600", "from-purple-500 to-pink-600"];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="card-hover"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* Banner */}
                <div
                  style={{ height: 120, display: "flex", alignItems: "center", fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.3)", position: "relative", letterSpacing: "-0.02em", flexShrink: 0, justifyContent: "center" }}
                  className={`bg-gradient-to-br ${color}`}
                >
                  {project.title.slice(0, 2).toUpperCase()}
                </div>

                {/* Content */}
                <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Owner */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Avatar username={project.user?.username || "dev"} avatarUrl={project.user?.avatarUrl} size={20} />
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{project.user?.username || "dev"}</span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{project.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--secondary)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                    {project.description}
                  </p>

                  {/* Tech */}
                  {project.techStack && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                      {project.techStack.split(",").filter(Boolean).slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "var(--surface-elevated)", border: "1px solid var(--border)", color: "var(--secondary)" }}
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats + actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} fill="currentColor" />
                        {project._count?.likes || 0}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                          style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)", transition: "color 150ms" }}
                          className="hover:text-primary">
                          <Github size={13} />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                          style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)", transition: "color 150ms" }}
                          className="hover:text-accent">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button id={`save-project-${project.id}`} onClick={() => toggleSave(project.id)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: savedIds.has(project.id) ? "var(--accent-muted)" : "transparent", color: savedIds.has(project.id) ? "var(--accent)" : "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms" }}>
                        <Star size={12} fill={savedIds.has(project.id) ? "var(--accent)" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
