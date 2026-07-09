"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function GlobalCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const cursorXSpring = useSpring(cursorX, { stiffness: 350, damping: 25 });
  const cursorYSpring = useSpring(cursorY, { stiffness: 350, damping: 25 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // Offset by 16px to center the 32px cursor
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        position: "fixed",
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "3px solid var(--primary)",
        background: "rgba(59, 130, 246, 0.25)",
        pointerEvents: "none",
        zIndex: 9999,
      }}
      className="hidden md:block shadow-[2.5px_2.5px_0px_var(--primary)]"
    />
  );
}
