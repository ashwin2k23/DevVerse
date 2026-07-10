"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Users, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { useApiClient } from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const gradients = [
  "from-sky-400 to-blue-600",
  "from-cyan-400 to-indigo-600",
  "from-teal-400 to-emerald-600",
  "from-pink-400 to-rose-600",
  "from-amber-400 to-orange-600",
  "from-violet-400 to-purple-600",
];

const emojis = ["⚛️", "📱", "☁️", "🎨", "⚙️", "🐙", "🚀", "💡", "🔧", "🌐"];

export default function CommunitiesPage() {
  const authApi = useApiClient();
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  // Creation Modal States
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await authApi.get(`/communities?q=${q}`);
      if (res.data?.success) {
        const data = res.data.data || [];
        setCommunities(data);
        const joined = new Set<string>(data.filter((c: any) => c.isMember).map((c: any) => c.id));
        setJoinedIds(joined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => fetchCommunities(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchCommunities]);

  const toggleJoin = async (communityId: string) => {
    const isJoined = joinedIds.has(communityId);
    setJoinedIds((prev) => { const n = new Set(prev); isJoined ? n.delete(communityId) : n.add(communityId); return n; });
    setCommunities((prev) => prev.map((c) =>
      c.id === communityId
        ? { ...c, _count: { ...c._count, members: (c._count?.members || 0) + (isJoined ? -1 : 1) } }
        : c
    ));
    try {
      if (isJoined) await authApi.delete(`/communities/${communityId}/leave`);
      else await authApi.post(`/communities/${communityId}/join`);
    } catch {
      setJoinedIds((prev) => { const n = new Set(prev); isJoined ? n.add(communityId) : n.delete(communityId); return n; });
      setCommunities((prev) => prev.map((c) =>
        c.id === communityId
          ? { ...c, _count: { ...c._count, members: (c._count?.members || 0) + (isJoined ? 1 : -1) } }
          : c
      ));
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await authApi.post("/communities", {
        name: newName.trim(),
        description: newDescription.trim(),
        isPrivate,
      });
      if (res.data?.success) {
        setCreateOpen(false);
        setNewName("");
        setNewDescription("");
        setIsPrivate(false);
        fetchCommunities(search);
      } else {
        setCreateError("Failed to create space.");
      }
    } catch (err: any) {
      console.error(err);
      setCreateError(err?.response?.data?.message || "Failed to create space.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Communities</h1>
            <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
              Join topic-focused spaces to discuss, share, and collaborate
            </p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button
                id="create-community-btn"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "var(--accent)", color: "white", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "opacity 150ms" }}
                className="hover:opacity-85"
              >
                <Plus size={15} />
                Create Space
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a new Space</DialogTitle>
                <DialogDescription>
                  Create a public or private topic-focused space to discuss, share, and collaborate.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCommunity} className="space-y-4 pt-2">
                {createError && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-xs">
                    {createError}
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="space-name">Space Name</Label>
                  <Input
                    id="space-name"
                    placeholder="e.g. NextJS Developers"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="space-description">Description</Label>
                  <Textarea
                    id="space-description"
                    placeholder="Describe the topic and rules of your space..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="space-private"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <Label htmlFor="space-private" className="cursor-pointer select-none">
                    Make this space private
                  </Label>
                </div>
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Space"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ position: "relative", marginBottom: 24 }}>
        <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input
          id="communities-search"
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px 10px 40px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", fontSize: 14, color: "var(--primary)", outline: "none" }}
          className="focus:border-accent/60"
        />
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : communities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          No communities found. Be the first to create one!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }} className="communities-grid">
          {communities.map((community, i) => {
            const grad = gradients[i % gradients.length];
            const emoji = emojis[i % emojis.length];
            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
                className="card-hover"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20, display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                  {/* Avatar Box */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}
                    className={`bg-gradient-to-br ${grad}`}>
                    {emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                      <Link href={`/communities/${community.slug}`} style={{ color: "inherit", textDecoration: "none" }} className="hover:text-accent">
                        {community.name}
                      </Link>
                    </h3>
                    <div style={{ display: "flex", gap: 12, color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Users size={12} />
                        {(community._count?.members || 0) >= 1000
                          ? `${((community._count?.members || 0) / 1000).toFixed(1)}K`
                          : community._count?.members || 0} members
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <MessageSquare size={12} />
                        {community._count?.posts || 0} posts
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "var(--secondary)", lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
                  {community.description}
                </p>

                {/* Tags */}
                {community.tags && community.tags.split(",").filter(Boolean).length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                    {community.tags.split(",").filter(Boolean).map((t: string) => (
                      <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "var(--surface-elevated)", border: "1px solid var(--border)", color: "var(--secondary)" }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Join Button */}
                <button
                  id={`join-community-${community.id}`}
                  onClick={() => toggleJoin(community.id)}
                  style={{ width: "100%", padding: "8px", borderRadius: "var(--radius)", border: "none", background: joinedIds.has(community.id) ? "var(--surface-elevated)" : "var(--accent)", color: joinedIds.has(community.id) ? "var(--secondary)" : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
                >
                  {joinedIds.has(community.id) ? "Leave Community" : "Join Community"}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .communities-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
