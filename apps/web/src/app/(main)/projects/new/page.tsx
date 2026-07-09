"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Save, FolderKanban, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const authApi = useApiClient();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await authApi.post("/projects", {
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.trim(),
        githubUrl: githubUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        tags: "",
        imageUrls: [],
      });

      if (res.data?.success) {
        router.push("/projects");
        router.refresh();
      } else {
        setError("Failed to create project.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 24, maxWidth: 640, margin: "0 auto", paddingBottom: 40 }}>
      {/* Back button */}
      <Link
        href="/projects"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 500, marginBottom: 20 }}
        className="hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Showcase a New Project</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Share your build with the DevVerse community
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "#EF4444", fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--secondary)" }}>Project Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. DevVerse Social Network"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--primary)", outline: "none" }}
            className="focus:border-accent/60"
          />
        </div>

        {/* Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--secondary)" }}>Description *</label>
          <textarea
            required
            rows={4}
            placeholder="What is this project about? What features does it have?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--primary)", outline: "none", resize: "vertical" }}
            className="focus:border-accent/60"
          />
        </div>

        {/* Tech Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--secondary)" }}>Tech Stack</label>
          <input
            type="text"
            placeholder="e.g. Next.js, TypeScript, TailwindCSS, Express"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--primary)", outline: "none" }}
            className="focus:border-accent/60"
          />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Comma-separated list of technologies</span>
        </div>

        {/* GitHub URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--secondary)" }}>GitHub Repository URL</label>
          <input
            type="url"
            placeholder="https://github.com/username/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--primary)", outline: "none" }}
            className="focus:border-accent/60"
          />
        </div>

        {/* Demo URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--secondary)" }}>Live Demo URL</label>
          <input
            type="url"
            placeholder="https://myproject.com"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 14, color: "var(--primary)", outline: "none" }}
            className="focus:border-accent/60"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", background: "var(--accent)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", marginTop: 10, transition: "opacity 150ms" }}
          className="hover:opacity-90"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Project...
            </>
          ) : (
            <>
              <FolderKanban size={16} />
              Publish Project
            </>
          )}
        </button>
      </form>
    </div>
  );
}
