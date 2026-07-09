"use client";

import React from 'react';

// ─── Rank Title Map ─────────────────────────────────────────────────────────
const RANK_TITLES: Record<number, string> = {
  1:  "Newbie",
  2:  "Code Cadet",
  3:  "Junior Dev",
  4:  "Apprentice",
  5:  "Midcore Dev",
  6:  "Builder",
  7:  "Senior Dev",
  8:  "Tech Lead",
  9:  "Architect",
  10: "Principal",
  11: "Staff Eng",
  12: "Pro Dev",
  13: "Expert",
  14: "Elite Coder",
  15: "Sage",
  16: "Mastermind",
  17: "Legendary",
  18: "Grand Master",
  19: "Mythic",
  20: "Transcendent",
};

export function getRankTitle(level: number): string {
  if (level <= 0) return "Newbie";
  if (level >= 20) return "Transcendent";
  return RANK_TITLES[level] ?? `Level ${level} Dev`;
}

// ─── Rank colour accent (bg gradient) ────────────────────────────────────────
function getRankColor(level: number): { from: string; to: string; glow: string } {
  if (level >= 18) return { from: "#f59e0b", to: "#dc2626", glow: "rgba(245,158,11,0.35)" };
  if (level >= 15) return { from: "#8b5cf6", to: "#ec4899", glow: "rgba(139,92,246,0.35)" };
  if (level >= 12) return { from: "#06b6d4", to: "#3b82f6", glow: "rgba(6,182,212,0.30)" };
  if (level >= 9)  return { from: "#10b981", to: "#059669", glow: "rgba(16,185,129,0.25)" };
  if (level >= 6)  return { from: "#2563eb", to: "#4f46e5", glow: "rgba(37,99,235,0.25)" };
  if (level >= 3)  return { from: "#3b82f6", to: "#6366f1", glow: "rgba(59,130,246,0.20)" };
  return { from: "#64748b", to: "#475569", glow: "rgba(100,116,139,0.15)" };
}

interface ExpLevelCardProps {
  /** Current level from the DB */
  level?: number;
  /** Total EXP points earned (computed from contributions) */
  totalExp?: number;
  /** EXP required per level — increases by expIncrement each level */
  expIncrement?: number;
}

/**
 * Static EXP Level Card — displays the user's level, rank title,
 * and progress bar based on real contribution data.
 * No interactive click-to-earn. No random EXP. Data-driven only.
 */
export default function ExpLevelCard({
  level = 1,
  totalExp = 0,
  expIncrement = 50,
}: ExpLevelCardProps) {
  const safeLevel   = Math.max(1, level);
  const rankTitle   = getRankTitle(safeLevel);
  const rankColor   = getRankColor(safeLevel);

  // EXP needed for next level scales: 100 + (level-1) * expIncrement
  const expForNext  = 100 + (safeLevel - 1) * expIncrement;
  const expInLevel  = totalExp % expForNext;               // EXP progress within current level
  const pct         = Math.min(100, Math.round((expInLevel / expForNext) * 100));

  const gradient = `linear-gradient(135deg, ${rankColor.from}, ${rankColor.to})`;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--background)",
        border: "1px solid var(--border)",
        boxShadow: `0 0 18px ${rankColor.glow}`,
        padding: "14px 16px 12px",
      }}
    >
      {/* Top row: Level badge + Rank title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        {/* Level badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 999,
            background: gradient,
            boxShadow: `0 2px 10px ${rankColor.glow}`,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.04em" }}>
            LEVEL {safeLevel}
          </span>
        </div>

        {/* Rank title */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: rankColor.from,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          {rankTitle}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 6,
          borderRadius: 999,
          background: "var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: gradient,
            borderRadius: 999,
            transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>

      {/* EXP numbers */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          {expInLevel} / {expForNext} XP
        </span>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>{pct}%</span>
      </div>
    </div>
  );
}
