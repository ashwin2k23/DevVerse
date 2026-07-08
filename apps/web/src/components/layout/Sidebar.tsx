"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  FolderKanban,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Bookmark,
  Settings,
  Compass,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/feed", icon: Newspaper, label: "Feed" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/communities", icon: Users, label: "Communities" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        width: "100%",
        padding: "6px",
        borderRadius: "var(--radius-xl)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        position: "relative",
      }}
      className="glass shadow-lg"
    >
      {/* Navigation items wrapper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          overflowX: "auto",
          width: "100%",
          paddingBottom: 2,
        }}
        className="hide-scrollbar"
      >
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`sidebar-${item.label.toLowerCase()}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: "var(--radius-lg)",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--accent)" : "var(--secondary)",
                transition: "color 150ms",
                textDecoration: "none",
                position: "relative",
                whiteSpace: "nowrap",
              }}
              className="hover:text-primary"
            >
              {/* Active Pill (persistent sliding capsule) */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(37,99,235,0.08)",
                    border: "1px solid rgba(37,99,235,0.15)",
                    zIndex: 0,
                  }}
                  className="dark:bg-accent/10 dark:border-accent/20"
                />
              )}

              {/* Hover Pill (sliding interactive capsule) */}
              <AnimatePresence>
                {hoveredIndex === idx && !isActive && (
                  <motion.div
                    layoutId="hover-pill"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "var(--radius-lg)",
                      background: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.03)",
                      zIndex: 0,
                    }}
                    className="dark:bg-white/5 dark:border-white/5"
                  />
                )}
              </AnimatePresence>

              {/* Icon & Label */}
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </span>

              {/* Message notification count */}
              {item.label === "Messages" && (
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    background: "var(--accent)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: "var(--radius-full)",
                    padding: "1px 5px",
                    minWidth: 16,
                    textAlign: "center",
                  }}
                >
                  3
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
