"use client";

import React, { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

function InstagramIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TwitterIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

interface ProfileCardProps {
  name?: string
  title?: string
  avatarUrl?: string
  backgroundUrl?: string
  likes?: number
  posts?: number
  views?: number
  level?: number
  instagramUrl?: string
  twitterUrl?: string
  threadsUrl?: string
  followStatus?: 'NONE' | 'PENDING' | 'ACCEPTED'
  isFollowing?: boolean
  onFollowToggle?: (e: React.MouseEvent) => void
  profileUrl?: string
}

export function ProfileCard({
  name = "Developer",
  title = "Product Builder & Developer",
  avatarUrl,
  backgroundUrl,
  likes = 0,
  posts = 0,
  views = 0,
  level = 1,
  instagramUrl,
  twitterUrl,
  threadsUrl,
  followStatus = 'NONE',
  isFollowing = false,
  onFollowToggle,
  profileUrl,
}: ProfileCardProps) {
  const [animatedLikes, setAnimatedLikes] = useState(0)
  const [animatedPosts, setAnimatedPosts] = useState(0)
  const [animatedViews, setAnimatedViews] = useState(0)
  const [expProgress, setExpProgress] = useState(0)

  // Real level-based EXP: progress within current tier of 10 levels
  const targetExp = Math.min(((level - 1) % 10) * 10 + 10, 100)

  // Animate experience bar toward real target
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setExpProgress((prev) => {
          if (prev >= targetExp) {
            clearInterval(interval)
            return targetExp
          }
          return prev + 1
        })
      }, 15)
      return () => clearInterval(interval)
    }, 200)
    return () => clearTimeout(timer)
  }, [targetExp])

  // Animate counters
  useEffect(() => {
    const duration = 1200
    const steps = 40
    const stepDuration = duration / steps

    const likesIncrement = likes / steps
    const postsIncrement = posts / steps
    const viewsIncrement = views / steps

    let currentStep = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++
        setAnimatedLikes(Math.min(Math.floor(likesIncrement * currentStep), likes))
        setAnimatedPosts(Math.min(Math.floor(postsIncrement * currentStep), posts))
        setAnimatedViews(Math.min(Math.floor(viewsIncrement * currentStep), views))

        if (currentStep >= steps) {
          clearInterval(interval)
        }
      }, stepDuration)
      return () => clearInterval(interval)
    }, 300)

    return () => clearTimeout(timer)
  }, [likes, posts, views])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    if (onFollowToggle) {
      onFollowToggle(e)
    }
  }

  // Determine button state from followStatus (preferred) or isFollowing fallback
  const effectiveStatus = followStatus !== 'NONE' ? followStatus : (isFollowing ? 'ACCEPTED' : 'NONE')
  const followLabel = effectiveStatus === 'ACCEPTED' ? 'Following' : effectiveStatus === 'PENDING' ? 'Requested' : 'Follow'
  const followSymbol = effectiveStatus === 'ACCEPTED' ? '✓' : effectiveStatus === 'PENDING' ? '…' : '+'
  const isActive = effectiveStatus !== 'NONE'

  const cardContent = (
    <div className="bg-card rounded-[2rem] shadow-lg overflow-hidden border border-border/60 hover:shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col h-full">
        {/* Header with background */}
        <div className="relative h-32 bg-gradient-to-br from-indigo-900 to-slate-900 overflow-hidden flex-shrink-0">
          {backgroundUrl && (
            <img
              src={backgroundUrl}
              alt="Background"
              className="w-full h-full object-cover opacity-60"
            />
          )}

          {/* Follow button */}
          <button
            onClick={handleFollowClick}
            type="button"
            className={`absolute top-4 right-4 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md transition-all duration-300 z-10 ${
              isActive
                ? "bg-surface-elevated text-secondary border border-border hover:bg-surface"
                : "bg-accent text-white hover:bg-accent-hover"
            }`}
          >
            {followLabel}
            <span className="ml-1 text-sm">{followSymbol}</span>
          </button>
        </div>

        {/* Profile content */}
        <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col">
          {/* Avatar */}
          <div className="relative w-20 h-20 mb-3 flex-shrink-0">
            <div className="w-full h-full rounded-full border-4 border-card overflow-hidden bg-card shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Experience bar */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Lv.{level}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-orange-500 via-yellow-500 via-green-500 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Name and title */}
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-card-foreground tracking-tight mb-1 hover:text-accent transition-colors flex items-center gap-1.5">
              {name}
              {profileUrl && <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed font-normal line-clamp-2 min-h-[32px]">
              {title}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border mt-auto flex-shrink-0">
            <div className="text-center">
              <div className="text-base font-bold text-card-foreground mb-0.5">{formatNumber(animatedLikes)}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Followers</div>
            </div>
            <div className="text-center border-l border-r border-border">
              <div className="text-base font-bold text-card-foreground mb-0.5">{animatedPosts}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-card-foreground mb-0.5">{formatNumber(animatedViews)}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Karma</div>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-6 mt-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Instagram Profile"
            >
              <InstagramIcon className="w-4 h-4 text-secondary hover:text-primary" />
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Twitter Profile"
            >
              <TwitterIcon className="w-4 h-4 text-secondary hover:text-primary" />
            </a>
            <a
              href={threadsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Threads Profile"
            >
              <svg
                className="w-4 h-4 text-secondary hover:text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </a>
          </div>
        </div>
    </div>
  )

  if (profileUrl) {
    return (
      <Link href={profileUrl} style={{ textDecoration: 'none', color: 'inherit' }} className="block w-full">
        {cardContent}
      </Link>
    )
  }

  return <div className="w-full">{cardContent}</div>
}
