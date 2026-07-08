"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Globe, Users, ArrowRight, Bookmark, Clock, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useApiClient } from "@/lib/api";

const eventTypes = ["All", "Hackathon", "Meetup", "Workshop", "Webinar", "Conference"];

const typeColors: Record<string, string> = {
  Conference: "#2563EB",
  Hackathon: "#F59E0B",
  Workshop: "#10B981",
  Meetup: "#7C3AED",
  Webinar: "#EF4444",
};

const gradients = [
  "from-blue-600 to-violet-700",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-700",
  "from-pink-500 to-rose-600",
];

export default function EventsPage() {
  const authApi = useApiClient();
  const [activeType, setActiveType] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const fetchEvents = useCallback(async (type = "All") => {
    setLoading(true);
    try {
      const q = type === "All" ? "" : `&type=${type}`;
      const res = await authApi.get(`/events?${q}`);
      if (res.data?.success) {
        const data = res.data.data || [];
        setEvents(data);
        // Pre-set state from API flags
        const regIds = new Set<string>(data.filter((e: any) => e.isRegistered).map((e: any) => e.id));
        const bmIds = new Set<string>(data.filter((e: any) => e.isBookmarked).map((e: any) => e.id));
        setRegisteredIds(regIds);
        setBookmarkedIds(bmIds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEvents(activeType);
  }, [activeType, fetchEvents]);

  const toggleRegister = async (id: string) => {
    const isReg = registeredIds.has(id);
    setRegisteredIds((prev) => { const n = new Set(prev); isReg ? n.delete(id) : n.add(id); return n; });
    try {
      if (isReg) await authApi.delete(`/events/${id}/register`);
      else await authApi.post(`/events/${id}/register`);
    } catch { setRegisteredIds((prev) => { const n = new Set(prev); isReg ? n.add(id) : n.delete(id); return n; }); }
  };

  const toggleBookmark = async (id: string) => {
    const isBm = bookmarkedIds.has(id);
    setBookmarkedIds((prev) => { const n = new Set(prev); isBm ? n.delete(id) : n.add(id); return n; });
    try {
      if (isBm) await authApi.delete(`/events/${id}/bookmark`);
      else await authApi.post(`/events/${id}/bookmark`);
    } catch { setBookmarkedIds((prev) => { const n = new Set(prev); isBm ? n.add(id) : n.delete(id); return n; }); }
  };

  const featured = events.find((e) => e.isFeatured);
  const rest = events.filter((e) => !e.isFeatured);

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Events</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Discover hackathons, meetups, workshops, and webinars
        </p>
      </motion.div>

      {/* Featured event */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-blue-600 to-violet-700"
          style={{ borderRadius: "var(--radius-lg)", padding: "32px 36px", marginBottom: 28, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.15)", color: "white", borderRadius: "var(--radius-full)", padding: "3px 10px", marginBottom: 12, display: "inline-block", letterSpacing: "0.05em" }}>
            ⭐ FEATURED EVENT
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.02em" }}>{featured.title}</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 20, maxWidth: 500 }}>{featured.description}</p>
          <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { icon: Calendar, text: featured.startDate ? new Date(featured.startDate).toDateString() : "" },
              { icon: featured.isOnline ? Globe : MapPin, text: featured.location || "Online" },
              { icon: Users, text: `${featured._count?.registrations || 0} registered` },
            ].filter(i => i.text).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                <item.icon size={13} />
                {item.text}
              </div>
            ))}
          </div>
          <button
            id="featured-register-btn"
            onClick={() => toggleRegister(featured.id)}
            style={{ background: "white", color: "#2563EB", border: "none", borderRadius: "var(--radius-full)", padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "opacity 150ms" }}
            className="hover:opacity-90"
          >
            {registeredIds.has(featured.id) ? "✓ Registered" : "Register Now"}
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Type filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {eventTypes.map((type) => (
          <button key={type} id={`event-filter-${type.toLowerCase()}`} onClick={() => setActiveType(type)}
            style={{ padding: "7px 16px", borderRadius: "var(--radius-full)", border: `1px solid ${activeType === type ? "var(--accent)" : "var(--border)"}`, background: activeType === type ? "var(--accent-muted)" : "var(--surface)", color: activeType === type ? "var(--accent)" : "var(--secondary)", fontSize: 13, fontWeight: activeType === type ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all 150ms" }}>
            {type}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      ) : rest.length === 0 && !featured ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          No events found. Create the first one!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="events-grid">
          {rest.map((event, i) => {
            const grad = gradients[i % gradients.length];
            const dateStr = event.startDate ? new Date(event.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
            return (
              <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.07, 0.35) }} className="card-hover"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.4)", position: "relative" }}
                  className={`bg-gradient-to-br ${grad}`}>
                  {event.title.slice(0, 2).toUpperCase()}
                  <span style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,0.3)", color: "white", borderRadius: "var(--radius-full)", padding: "3px 10px", backdropFilter: "blur(8px)" }}>
                    {event.type}
                  </span>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{event.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                    {event.description}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
                    {dateStr && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--secondary)" }}><Calendar size={12} />{dateStr}</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--secondary)" }}>
                      {event.isOnline ? <Globe size={12} /> : <MapPin size={12} />}
                      {event.location || "Online"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--secondary)" }}>
                      <Users size={12} />{event._count?.registrations || 0} attendees
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button id={`register-${event.id}`} onClick={() => toggleRegister(event.id)}
                      style={{ flex: 1, padding: "8px", borderRadius: "var(--radius)", border: "none", background: registeredIds.has(event.id) ? "rgba(16,185,129,0.1)" : "var(--accent)", color: registeredIds.has(event.id) ? "#10B981" : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}>
                      {registeredIds.has(event.id) ? "✓ Registered" : "Register"}
                    </button>
                    <button id={`bookmark-event-${event.id}`} onClick={() => toggleBookmark(event.id)}
                      style={{ width: 34, height: 34, borderRadius: "var(--radius)", border: "1px solid var(--border)", background: bookmarkedIds.has(event.id) ? "var(--accent-muted)" : "transparent", color: bookmarkedIds.has(event.id) ? "var(--accent)" : "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 150ms" }}>
                      <Bookmark size={14} fill={bookmarkedIds.has(event.id) ? "var(--accent)" : "none"} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) { .events-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
