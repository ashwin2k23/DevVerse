"use client";

import { motion } from "framer-motion";
import React from "react";

interface DoodleProps {
  className?: string;
  delay?: number;
  color?: string;
}

// ─── Squiggle Underline for text ───────────────────────────────────────────
export function SquiggleUnderline({ className = "", delay = 0.2, color = "currentColor" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 200 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute -bottom-2 left-0 w-full overflow-visible ${className}`}
      style={{ pointerEvents: "none" }}
    >
      <motion.path
        d="M 4 8 C 40 1, 80 12, 120 4 C 150 -1, 175 10, 196 6"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 1.2, ease: "easeOut", delay }}
      />
    </svg>
  );
}

// ─── Highlight Circle to highlight stats/badges ────────────────────────────
export function HighlightCircle({ className = "", delay = 0.3, color = "currentColor" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 100 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full overflow-visible ${className}`}
      style={{ pointerEvents: "none" }}
    >
      <motion.path
        d="M 6 22 C 10 6, 85 4, 94 18 C 98 32, 12 39, 8 26 C 6 16, 52 10, 92 14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut", delay }}
      />
    </svg>
  );
}

// ─── Curly Arrow with optional handwritten text label ──────────────────────
interface CurlyArrowProps extends DoodleProps {
  text?: string;
  textOffset?: { x?: number | string; y?: number | string };
  rotation?: number;
}

export function CurlyArrow({
  className = "",
  delay = 0.5,
  color = "var(--accent)",
  text = "",
  textOffset = {},
  rotation = 0,
}: CurlyArrowProps) {
  return (
    <div
      className={`relative overflow-visible select-none pointer-events-none ${className}`}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 overflow-visible"
        style={{ color, transform: `rotate(${rotation}deg)` }}
      >
        {/* Curvy arrow shaft */}
        <motion.path
          d="M 12 12 C 22 45, 52 52, 66 32 C 74 18, 44 14, 36 28 C 28 42, 46 64, 68 60"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut", delay }}
        />
        {/* Arrow head */}
        <motion.path
          d="M 54 50 L 68 60 L 62 43"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 1.2 }}
        />
      </svg>
      {text && (
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 10, delay: delay + 1.3 }}
          className="absolute font-cartoon text-xs font-bold whitespace-nowrap bg-amber-100 dark:bg-amber-950/90 px-2 py-0.5 border border-primary/20 rounded shadow-sm text-primary"
          style={{
            left: textOffset.x ?? -85,
            top: textOffset.y ?? -15,
            transform: "rotate(-6deg)",
            color: "var(--primary)",
            borderColor: "var(--primary)",
            boxShadow: "2px 2px 0px var(--primary)",
          }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}

// ─── Star Sparkle ──────────────────────────────────────────────────────────
export function StarSparkle({ className = "", delay = 0.1, color = "var(--warning)" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 animate-doodle-float overflow-visible ${className}`}
      style={{ color, pointerEvents: "none" }}
    >
      <motion.path
        d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.6L12 0Z"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, delay }}
      />
    </svg>
  );
}

// ─── Curly Bracket Doodle ──────────────────────────────────────────────────
export function CurlyBracketsDoodle({ className = "", delay = 0.4, color = "var(--muted)" }: DoodleProps) {
  return (
    <div className={`flex gap-16 font-cartoon text-4xl font-extrabold select-none pointer-events-none opacity-20 dark:opacity-10 ${className}`}>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", delay }}
        style={{ color }}
      >
        &#123;
      </motion.div>
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", delay: delay + 0.1 }}
        style={{ color }}
      >
        &#125;
      </motion.div>
    </div>
  );
}

// ─── Angle Brackets Code Doodle ────────────────────────────────────────────
export function CodeBracketsDoodle({ className = "", delay = 0.5, color = "var(--accent-muted)" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-12 h-8 opacity-25 dark:opacity-15 animate-doodle-wobble ${className}`}
      style={{ color, pointerEvents: "none" }}
    >
      {/* < */}
      <motion.path
        d="M14 6 L4 16 L14 26"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
      />
      {/* / */}
      <motion.path
        d="M20 28 L28 4"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      />
      {/* > */}
      <motion.path
        d="M34 6 L44 16 L34 26"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: delay + 0.4 }}
      />
    </svg>
  );
}

// ─── Playful Coffee Mug Doodle ─────────────────────────────────────────────
export function CoffeeMugDoodle({ className = "", delay = 0.6, color = "var(--secondary)" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-10 h-10 opacity-30 dark:opacity-15 animate-doodle-float ${className}`}
      style={{ color, pointerEvents: "none" }}
    >
      {/* Mug Body */}
      <motion.path
        d="M6 10 C6 10, 6 25, 12 25 L20 25 C26 25, 26 10, 26 10 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay }}
      />
      {/* Handle */}
      <motion.path
        d="M26 13 C29 13, 31 15, 31 17 C 31 19, 29 21, 26 21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      />
      {/* Hot Steam lines */}
      <motion.path
        d="M10 6 C10 4, 11 3, 11 1 M16 6 C16 4, 17 3, 17 1 M22 6 C22 4, 23 3, 23 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: delay + 0.6 }}
      />
    </svg>
  );
}

// ─── Playful Lightbulb Doodle ──────────────────────────────────────────────
export function LightbulbDoodle({ className = "", delay = 0.4, color = "var(--warning)" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-10 h-10 opacity-35 dark:opacity-15 animate-doodle-float ${className}`}
      style={{ color, pointerEvents: "none" }}
    >
      {/* Bulb head */}
      <motion.path
        d="M16 4 C11 4, 7 8, 7 13 C7 16, 9 19, 11 21 L11 25 L21 25 L21 21 C23 19, 25 16, 25 13 C25 8, 21 4, 16 4 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay }}
      />
      {/* Base */}
      <motion.path
        d="M12 28 L20 28 M14 31 L18 31"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      />
      {/* Filament */}
      <motion.path
        d="M13 14 L16 11 L19 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.6 }}
      />
    </svg>
  );
}
