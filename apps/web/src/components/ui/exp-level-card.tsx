"use client";

import React, { useState, useEffect } from 'react';

interface ExpLevelCardProps {
  initialLevel?: number;
  initialExp?: number;
  expIncrement?: number;
  baseColorClass?: string;
  highlightColorClass?: string;
  onLevelUp?: (newLevel: number) => void;
  onGainExp?: (newExp: number, newLevel: number) => void;
  interactive?: boolean;
}

/**
 * High-Quality, Remixable EXP Level Card Component.
 *
 * Displays current level and progress toward the next level.
 * Fully customizable via props for colors, starting stats, and EXP curve.
 */
export default function ExpLevelCard({
  initialLevel = 1,
  initialExp = 0,
  expIncrement = 50,
  baseColorClass = 'from-red-600 to-rose-900',
  highlightColorClass = 'border-red-500',
  onLevelUp,
  onGainExp,
  interactive = true,
}: ExpLevelCardProps) {
  const [level, setLevel] = useState(initialLevel);
  const [exp, setExp] = useState(initialExp);

  // Sync state if props change (e.g. after DB fetches)
  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    setExp(initialExp);
  }, [initialExp]);

  // Compute EXP needed based on current level
  const expToNextLevel = 100 + (level - 1) * expIncrement;

  // Handle gaining random EXP on click
  const handleGainExp = () => {
    if (!interactive) return;

    const gained = Math.floor(Math.random() * 50) + 10;
    const totalExp = exp + gained;

    if (totalExp >= expToNextLevel) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setExp(totalExp - expToNextLevel);
      if (onLevelUp) onLevelUp(nextLevel);
      if (onGainExp) onGainExp(totalExp - expToNextLevel, nextLevel);
    } else {
      setExp(totalExp);
      if (onGainExp) onGainExp(totalExp, level);
    }
  };

  // Progress bar width
  const progressWidth = `${(exp / expToNextLevel) * 100}%`;

  return (
    <div
      onClick={handleGainExp}
      style={{ userSelect: 'none' }}
      className={`
        relative 
        w-28 
        h-20 
        rounded-lg 
        overflow-hidden 
        bg-gradient-to-br ${baseColorClass} 
        border-2 ${highlightColorClass} 
        shadow-xl 
        hover:scale-105
        active:scale-95
        cursor-pointer 
        transition-all 
        duration-300
      `}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          LEVEL {level}
        </span>
        <span className="text-lg font-black text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          EXP
        </span>
      </div>

      <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  );
}
