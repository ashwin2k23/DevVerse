"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useDbUser } from "@/context/DbUserContext";
import {
  LayoutDashboard,
  Newspaper,
  Compass,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { dbUser } = useDbUser();

  const localUsername =
    dbUser?.username ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] ||
    user?.id;

  const mobileNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/feed", icon: Newspaper, label: "Feed" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/messages", icon: MessageSquare, label: "Chat" },
    { href: localUsername ? `/profile/${localUsername}` : "#", icon: User, label: "Profile" },
  ];

  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
        }}
      >
        {mobileNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`bottom-nav-${item.label.toLowerCase()}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 4px",
                color: isActive ? "var(--accent)" : "var(--secondary)",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
