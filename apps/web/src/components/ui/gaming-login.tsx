'use client';
import React, { useRef, useEffect } from 'react';

// ─── Video Background ─────────────────────────────────────────────────────────
interface VideoBackgroundProps {
  videoUrl?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl = '/auth-bg.mp4',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Programmatically ensure muted is true (React attribute bypass check)
    video.muted = true;

    const playVideo = () => {
      video.play().catch((err) => {
        console.warn("Autoplay blocked or failed, waiting for user interaction:", err);
      });
    };

    playVideo();

    // Fallback: Play when user interacts with the page (clicks anywhere)
    const handleInteraction = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* z-[0] — Gradient fallback (shows while video loads / if autoplay blocked) */}
      <div className="absolute inset-0 z-[0] bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900" />

      {/* z-[1] — Actual video, rendered above the gradient */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-[1] w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* z-[2] — Semi-transparent dark overlay so text stays readable */}
      <div className="absolute inset-0 z-[2] bg-black/50" />
    </div>
  );
};


// ─── Auth Shell — wraps any Clerk component in the gaming backdrop ─────────────
interface AuthShellProps {
  /** The Clerk <SignIn /> or <SignUp /> component */
  children: React.ReactNode;
  /** Optional video URL (defaults to /auth-bg.mp4 in public/) */
  videoUrl?: string;
  /** "login" | "signup" — controls branding copy */
  mode?: 'login' | 'signup';
}

export const AuthShell: React.FC<AuthShellProps> = ({
  children,
  videoUrl,
  mode = 'login',
}) => {
  const isLogin = mode === 'login';

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* ── Video Background ── */}
      <VideoBackground videoUrl={videoUrl} />

      {/* ── Animated ambient orbs ── */}
      <div className="absolute inset-0 z-[11] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-32 left-1/3 w-96 h-80 rounded-full bg-pink-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Branding header ── */}
      <div className="relative z-20 mb-6 text-center select-none">
        {/* Logo / wordmark */}
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
            Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Verse</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-white/70 text-sm font-medium tracking-wide">
          {isLogin ? (
            <>Welcome back — your universe awaits 🚀</>
          ) : (
            <>Join thousands of developers building together 🛸</>
          )}
        </p>

        {/* Decorative pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/60 font-medium">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </span>
        </div>
      </div>

      {/* ── Clerk form card ── */}
      <div className="relative z-20 w-full max-w-md px-4 animate-[fadeInUp_0.5s_ease_both]">
        {/* Glass backdrop behind the Clerk card */}
        <div className="absolute inset-0 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50 pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-20 mt-8 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} DevVerse. All rights reserved.
      </footer>
    </div>
  );
};
