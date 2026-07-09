"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  Code2,
  Search,
  Bell,
  Sun,
  Moon,
  X,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiClient } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { formatRelativeTime } from "@/lib/utils";

export default function Navbar() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const authApi = useApiClient();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await authApi.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on("notification:new", handleNewNotification);
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, user]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    try {
      await authApi.put("/notifications/read-all");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: 64,
          borderBottom: "1px solid var(--border)",
          background: "var(--navbar-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Code2 size={16} color="white" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: "-0.03em",
              }}
              className="hidden sm:block"
            >
              DevVerse
            </span>
          </Link>

          {/* Search bar */}
          <button
            id="navbar-search-btn"
            onClick={() => setShowSearch(true)}
            style={{
              flex: 1,
              maxWidth: 420,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              padding: "9px 16px",
              cursor: "text",
              color: "var(--muted)",
              fontSize: 13,
              transition: "border-color 150ms, box-shadow 150ms",
            }}
            className="hover:border-accent/40 hidden md:flex"
          >
            <Search size={14} />
            <span style={{ flex: 1, textAlign: "left" }}>Search developers, projects...</span>
          </button>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {/* Mobile search */}
            <button
              id="mobile-search-btn"
              onClick={() => setShowSearch(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--secondary)",
                cursor: "pointer",
                transition: "background 150ms",
              }}
              className="md:hidden hover:bg-surface"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {/* Theme toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--secondary)",
                cursor: "pointer",
                transition: "background 150ms",
              }}
              className="hover:bg-surface"
              aria-label="Toggle theme"
            >
              {mounted ? (
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </motion.div>
              ) : (
                <div style={{ width: 16, height: 16 }} />
              )}
            </button>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                id="notifications-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--secondary)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 150ms",
                }}
                className="hover:bg-surface"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {/* Unread badge */}
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      border: "2px solid var(--background)",
                    }}
                  />
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 44,
                      width: 360,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-xl)",
                      overflow: "hidden",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          fontSize: 12,
                          color: "var(--accent)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Mark all read
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--secondary)", fontSize: 13 }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n, i) => (
                        <div
                          key={n.id || i}
                          style={{
                            padding: "14px 20px",
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                            borderBottom: i < Math.min(notifications.length, 5) - 1 ? "1px solid var(--border-subtle)" : "none",
                            background: !n.readAt ? "var(--accent-muted)" : "transparent",
                            cursor: "pointer",
                            transition: "background 150ms",
                          }}
                          className="hover:bg-surface-elevated"
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: !n.readAt ? "var(--accent)" : "transparent",
                              flexShrink: 0,
                              marginTop: 6,
                            }}
                          />
                          <div>
                            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--primary)" }}>
                              {n.fromUser && (
                                <strong style={{ fontWeight: 600, marginRight: 4 }}>{n.fromUser.username}</strong>
                              )}
                              {n.message}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{formatRelativeTime(n.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div style={{ padding: 12, textAlign: "center" }}>
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User button */}
            <div style={{ marginLeft: 4 }}>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: 34,
                      height: 34,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close */}
      {notifOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 30 }}
          onClick={() => setNotifOpen(false)}
        />
      )}
    </>
  );
}
