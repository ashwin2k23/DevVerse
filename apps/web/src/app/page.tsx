"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Code2,
  Users,
  Zap,
  Trophy,
  Globe,
  Star,
  Rocket,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Calendar,
  Layers,
  Plus,
  ArrowUpRight,
  Activity,
  Check,
  BookOpen,
  Heart,
  Sparkles,
  Clock,
  User,
  ExternalLink,
  Shield,
  ArrowDown
} from "lucide-react";
import { Github as GithubIcon, Twitter as TwitterIcon, Linkedin as LinkedinIcon } from "@/components/shared/BrandIcons";

// ─── STATS TYPES ─────────────────────────────────────────────────────────
interface Stats {
  developers: number;
  projects: number;
  communities: number;
  events: number;
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── STAT CARD ───────────────────────────────────────────────────────────
function StatCard({
  value,
  suffix = "+",
  label,
  sub,
  delay,
  animate,
}: {
  value: number;
  suffix?: string;
  label: string;
  sub: string;
  delay: number;
  animate: boolean;
}) {
  const count = useCountUp(value, 1600 + delay * 100, animate);

  const display = count >= 1000
    ? count >= 1000000
      ? `${(count / 1000000).toFixed(1)}M`
      : `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
    : `${count}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="group relative p-6 rounded-2xl border border-zinc-800 bg-[#111827]/40 backdrop-blur-sm hover:border-zinc-700/80 transition-all text-center overflow-hidden"
    >
      {/* subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      <div className="relative z-10">
        <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1 tabular-nums">
          {display}
          <span className="text-blue-400">{suffix}</span>
        </div>
        <div className="text-sm font-bold text-zinc-200 mb-1">{label}</div>
        <div className="text-xs text-zinc-500">{sub}</div>
      </div>
    </motion.div>
  );
}

// ─── STATS SECTION ───────────────────────────────────────────────────────
function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${apiBase}/api/stats`)
      .then((r) => r.json())
      .then((data: Stats) => setStats(data))
      .catch(() => {
        // Fallback to zeros — counters simply won't animate
        setStats({ developers: 0, projects: 0, communities: 0, events: 0 });
      });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const items = [
    { value: stats?.developers ?? 0, label: "Developers",   sub: "Registered accounts",    suffix: "+" },
    { value: stats?.projects    ?? 0, label: "Projects",     sub: "Public repositories",     suffix: "+" },
    { value: stats?.communities ?? 0, label: "Communities",  sub: "Active tech spaces",      suffix: "+" },
    { value: stats?.events      ?? 0, label: "Events",       sub: "Workshops & meetups",     suffix: "+" },
  ];

  return (
    <section ref={ref} className="py-16 relative border-y border-zinc-900 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <StatCard key={item.label} {...item} delay={i} animate={inView && stats !== null} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BACKGROUND PARTICLES ────────────────────────────────────────────────
const Particle = ({ delay = 0, className = "" }) => (
  <motion.div
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      opacity: [0.1, 0.25, 0.1],
      scale: [1, 1.15, 1],
    }}
    transition={{
      duration: 10 + delay * 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className={`absolute h-1.5 w-1.5 rounded-full ${className}`}
  />
);

const BackgroundLayers = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#09090B]">
      {/* Radial glows */}
      <div className="absolute -top-[10%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[130px]" />
      <div className="absolute top-[25%] right-[-10%] h-[800px] w-[800px] rounded-full bg-purple-500/12 blur-[160px]" />
      <div className="absolute bottom-[10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-indigo-500/8 blur-[140px]" />
      <div className="absolute -bottom-[10%] right-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Noise background */}
      <div className="absolute inset-0 noise-bg opacity-[0.85]" />

      {/* Particles */}
      <Particle delay={0} className="top-[15%] left-[20%] bg-blue-400" />
      <Particle delay={3} className="top-[40%] right-[15%] bg-purple-400" />
      <Particle delay={1.5} className="bottom-[35%] left-[30%] bg-indigo-400" />
      <Particle delay={5} className="top-[70%] left-[12%] bg-pink-400" />
    </div>
  );
};

// ─── REUSABLE HELPERS ────────────────────────────────────────────────────
const SectionHeader = ({ tag, title, description, id }: { tag: string; title: string; description: string; id?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="text-center max-w-3xl mx-auto mb-16"
    id={id}
  >
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-4">
      <Sparkles size={12} className="animate-pulse" />
      {tag}
    </span>
    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
      {title}
    </h2>
    <p className="text-lg text-gray-400 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

// ─── THEME TOGGLE ────────────────────────────────────────────────────────
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900/40" />;
  }

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      aria-label="Toggle theme"
    >
      {theme === "dark" && <Moon size={16} />}
      {theme === "light" && <Sun size={16} />}
      {(theme === "system" || !theme) && <Monitor size={16} />}
    </button>
  );
};

// ─── NAVBAR ──────────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Why DevVerse", href: "#why-devverse" },
    { label: "Journey", href: "#journey" },
    { label: "FAQ", href: "#faq" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section on scroll
      const scrollPos = window.scrollY + 100;
      for (const item of navItems) {
        const el = document.querySelector(item.href);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          const height = (el as HTMLElement).offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.href);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090B]/85 border-b border-zinc-800/80 backdrop-blur-xl shadow-lg shadow-[#09090B]/25 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <Code2 size={18} className="text-white" />
          </motion.div>
          <span className="font-extrabold text-xl tracking-tight text-white transition-colors group-hover:text-blue-400">
            DevVerse
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative py-1.5"
            >
              {item.label}
              {activeSection === item.href && (
                <motion.span
                  layoutId="activeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA & Tools */}
        <div className="hidden lg:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-4 py-2 rounded-lg"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="group relative inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all shadow-lg shadow-blue-500/20 hover:shadow-purple-500/30 overflow-hidden hover:scale-[1.02]"
          >
            Get started
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 bg-zinc-900/40"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden w-full bg-[#09090B]/98 border-b border-zinc-800 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-zinc-300 hover:text-white border-b border-zinc-900 pb-2"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg font-semibold text-zinc-300 border border-zinc-800 hover:bg-zinc-900 transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── HERO SECTION ────────────────────────────────────────────────────────
function HeroSection() {
  const headingRef = useRef(null);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/20 text-xs font-semibold tracking-wide text-blue-300 shadow-md shadow-blue-500/5 hover:border-purple-500/40 hover:bg-purple-950/20 transition-all duration-300 cursor-pointer mb-8"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Rocket size={13} className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          <span>The Developer Social Network</span>
          <ChevronRight size={12} className="text-blue-400/80 group-hover:translate-x-0.5 transition-transform duration-200" />
        </motion.div>

        {/* Typography Heading */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-white mb-8 max-w-5xl leading-[1.05]"
        >
          Where Developers <br />
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="gradient-text bg-[length:200%_auto]"
          >
            Connect & Build
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12"
        >
          Showcase your projects, connect with brilliant peers, join tech-focused communities, and accelerate your engineering journey — all in one clean space.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center relative"
        >
          {/* Primary CTA */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />
            <Link
              href="/sign-up"
              className="relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-100 transition-colors shadow-xl"
            >
              Start for free
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </Link>
          </div>

          {/* Secondary CTA */}
          <Link
            href="#why-devverse"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-900/60 text-white border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all backdrop-blur-md hover:scale-[1.01]"
          >
            Explore features
            <ArrowDown size={15} className="animate-bounce" />
          </Link>
        </motion.div>

        {/* Subtle detail arrow text overlay */}
        <div className="mt-4 text-xs text-zinc-500 hidden lg:block">
          No credit card required. Free forever.
        </div>
      </div>
    </section>
  );
}

// ─── DASHBOARD PREVIEW ───────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pb-24 z-20">
      {/* Glow underneath the box */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-4/5 h-[200px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute -top-6 left-1/3 -translate-x-1/2 w-1/2 h-[120px] bg-blue-600/10 blur-[80px] pointer-events-none rounded-full" />

      {/* Frame wrapper with slight floating */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl border border-zinc-800 bg-[#0c101b]/95 p-3 sm:p-4 shadow-2xl shadow-blue-900/10 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
            <span className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
          </div>
          <div className="text-xs text-zinc-500 bg-zinc-900/50 px-6 py-1 rounded-md border border-zinc-800/80 font-mono">
            devverse.app/dashboard
          </div>
          <div className="w-12 h-2" />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="md:col-span-1 border-r border-zinc-900/60 pr-4 flex flex-col gap-1.5">
            {[
              { label: "Dashboard", icon: Layers, active: true },
              { label: "Feed", icon: Activity },
              { label: "Projects", icon: Code2 },
              { label: "Communities", icon: Users },
              { label: "Events", icon: Calendar },
              { label: "Reputation", icon: Trophy }
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  item.active
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <item.icon size={14} className={item.active ? "text-blue-400" : "text-zinc-500"} />
                {item.label}
              </div>
            ))}
            <div className="mt-8 border-t border-zinc-900/60 pt-4">
              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider px-3 mb-2">My Spaces</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500"><span className="w-2 h-2 rounded-full bg-blue-500" />React Core</div>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500"><span className="w-2 h-2 rounded-full bg-purple-500" />Rustaceans</div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="md:col-span-3 flex flex-col gap-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "Reputation Score", val: "1,420", color: "text-blue-400", metric: "Top 5%" },
                { title: "Project Stars", val: "248", color: "text-purple-400", metric: "+12 this week" },
                { title: "Contributions", val: "84", color: "text-emerald-400", metric: "Daily streak: 14" }
              ].map((m, idx) => (
                <div key={idx} className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">{m.title}</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-xl font-bold ${m.color}`}>{m.val}</span>
                    <span className="text-[9px] text-zinc-400">{m.metric}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton list item representing updates */}
            <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3">
                <span className="text-xs font-semibold text-zinc-300">Activity Stream</span>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live updates
                </span>
              </div>

              {/* Shimmer items */}
              {[1, 2].map((itm) => (
                <div key={itm} className="flex gap-4 items-start border-b border-zinc-900/40 pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 shimmer" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 w-1/3 bg-zinc-800 rounded shimmer" />
                    <div className="h-2 w-3/4 bg-zinc-900 rounded shimmer" />
                  </div>
                  <div className="h-2 w-12 bg-zinc-900 rounded shimmer" />
                </div>
              ))}
            </div>

            {/* Empty state dashboard placeholder */}
            <div className="border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <Code2 size={16} className="text-zinc-500" />
              </div>
              <span className="text-xs font-semibold text-zinc-400 mb-1">No repositories linked yet</span>
              <p className="text-[11px] text-zinc-500 max-w-xs mb-3">Link your GitHub account to import and showcase your projects instantly.</p>
              <button className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-semibold text-zinc-300 flex items-center gap-1.5 transition-all">
                <GithubIcon size={12} />
                Connect GitHub
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── FEATURES HIGHLIGHTS ────────────────────────────────────────────────
function FeaturesHighlights() {
  const featuresList = [
    {
      icon: Code2,
      title: "Project Showcase",
      description: "Import repositories directly from GitHub. Display technology tags, screenshot galleries, and live links in a custom design.",
      color: "from-blue-500/10 to-indigo-500/2"
    },
    {
      icon: Users,
      title: "Developer Communities",
      description: "Join spaces tailored to frontend framework stacks, backend database performance, DevOps orchestrations, or game design systems.",
      color: "from-purple-500/10 to-pink-500/2"
    },
    {
      icon: User,
      title: "Premium Portfolio",
      description: "Every account compiles into a public resume profile containing open source stats, daily streaks, skills, and community activity.",
      color: "from-emerald-500/10 to-teal-500/2"
    },
    {
      icon: Calendar,
      title: "Events & Hackathons",
      description: "Discover coding marathons, host webinars, coordinate physical meetups, and register for workshops around the globe.",
      color: "from-pink-500/10 to-rose-500/2"
    },
    {
      icon: Shield,
      title: "Open Source Hub",
      description: "List open issues on repositories, label issues welcoming first-time contributors, and find developers to build out tools.",
      color: "from-cyan-500/10 to-sky-500/2"
    },
    {
      icon: Zap,
      title: "Instant Messaging",
      description: "Engage in direct chats with collaborators or prompt discussions inside channels. Seamless typing indicators and indicators.",
      color: "from-amber-500/10 to-orange-500/2"
    }
  ];

  return (
    <section id="features" className="py-24 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          tag="Core Platform"
          title="Engineered to accelerate your developer journey"
          description="Everything you need to grow your reputation, collaborate on codebases, and represent your engineering profile."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="glow-card p-6 flex flex-col h-full bg-[#111827] border border-zinc-800/80 rounded-2xl relative overflow-hidden group cursor-pointer"
            >
              {/* Card gradient bg decoration */}
              <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${feat.color} opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none`} />

              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 relative z-10">
                <feat.icon size={18} className="text-blue-400 group-hover:text-purple-400 transition-colors" />
              </div>

              <h3 className="text-lg font-bold text-white mb-3 relative z-10 group-hover:text-blue-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed relative z-10 flex-1">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY DEVVERSE ────────────────────────────────────────────────────────
function WhyDevVerse() {
  const points = [
    {
      title: "Showcase your work",
      desc: "Go beyond static markdown. Render live projects, link demo hosts, and outline tech stacks visually.",
      icon: Code2
    },
    {
      title: "Collaborate seamlessly",
      desc: "Discover repositories matching your language competencies and coordinate pull requests easily.",
      icon: Activity
    },
    {
      title: "Find teammates",
      desc: "Assemble teams for hackathons, select peers by stack proficiency, and coordinate workflows.",
      icon: Users
    },
    {
      title: "Grow your network",
      desc: "Maintain profiles, share dev milestones, gather feedback, and link up with global engineers.",
      icon: Globe
    },
    {
      title: "Join communities",
      desc: "Participate in sub-communities focused on specialized technical targets like Web3, Rust, AI.",
      icon: Layers
    },
    {
      title: "Attend events",
      desc: "Keep up with engineering events, meetups, and live study groupings directly inside calendars.",
      icon: Calendar
    }
  ];

  return (
    <section id="why-devverse" className="py-24 relative border-t border-zinc-900 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          tag="Values"
          title="Why developers build here"
          description="DevVerse is optimized specifically for engineers. A workspace that focuses on projects and profiles over algorithms."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((pt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl border border-zinc-800 bg-[#111827]/40 backdrop-blur-sm hover:border-zinc-700/80 transition-all group flex flex-col gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-colors">
                <pt.icon size={16} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-2">{pt.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{pt.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DEVELOPER JOURNEY TIMELINE ──────────────────────────────────────────
function DeveloperJourney() {
  const steps = [
    {
      step: "01",
      title: "Create Profile",
      description: "Initialize your dev profile, showcase your bio, and aggregate social references."
    },
    {
      step: "02",
      title: "Add Projects",
      description: "Import GitHub codebases, detail feature sets, tag stacks, and display live URLs."
    },
    {
      step: "03",
      title: "Join Communities",
      description: "Find technology specific groups, participate in discussion threads, and coordinate chats."
    },
    {
      step: "04",
      title: "Collaborate",
      description: "Pitch in on open issues, join project repositories, and structure workflow sessions."
    },
    {
      step: "05",
      title: "Grow",
      description: "Earn community badges, secure level certifications, and showcase your profile."
    }
  ];

  return (
    <section id="journey" className="py-24 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          tag="Roadmap"
          title="The Developer Journey"
          description="A clear path to represent your skills, publish codebases, connect with communities, and level up."
        />

        <div className="relative mt-20 max-w-4xl mx-auto">
          {/* Vertical Connecting Line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-zinc-800 -translate-x-1/2 pointer-events-none" />

          <div className="flex flex-col gap-12">
            {steps.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`relative flex flex-col md:flex-row gap-8 items-start ${
                  i % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Node indicator */}
                <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full border-2 border-purple-500 bg-[#09090B] flex items-center justify-center -translate-x-1/2 shadow-lg shadow-purple-500/20 z-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                </div>

                {/* Content */}
                <div className={`w-full md:w-[45%] pl-14 md:pl-0 ${i % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm inline-block text-left w-full hover:border-zinc-700/80 transition-colors">
                    <span className="text-xs font-bold text-blue-400">{st.step}</span>
                    <h5 className="text-base font-bold text-white mt-1 mb-2">{st.title}</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">{st.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ SECTION ─────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-zinc-900 py-4.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left text-zinc-200 hover:text-white font-bold text-base py-2 focus:outline-none transition-colors"
      >
        <span>{q}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-300 ${open ? "rotate-180 text-blue-400" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-zinc-400 leading-relaxed pt-2 pb-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "What is DevVerse?",
      a: "DevVerse is a premium developer-focused social platform where software engineers can display custom project portfolios, join sub-communities matching their technology stacks, share code snippets, coordinate open source milestones, and discover global meetups."
    },
    {
      q: "Is it free to use?",
      a: "Yes! DevVerse is completely free forever for individual developers. Our features focusing on showcase templates, community threads, streaking levels, and messaging tools require no subscriptions."
    },
    {
      q: "Can I host live projects here?",
      a: "No, DevVerse is a social display catalog, not a hosting server. You link project repositories directly from GitHub and link live endpoints hosted on cloud providers (like Vercel, Netlify, Fly.io, etc.) so reviewers can access your code and live product."
    },
    {
      q: "How do communities work?",
      a: "Communities are dedicated, moderable spaces centered on engineering skills (e.g. React developers, Rustaceans). Inside, you can create discussion threads, seek help debugging bugs, post jobs, and converse in chat rooms."
    },
    {
      q: "Can coding students join?",
      a: "Absolutely! DevVerse is welcoming to developers of all backgrounds and levels. Whether you are building your first HTML pages or scaling up kubernetes pods at major companies, you will find spaces and projects to fit your path."
    }
  ];

  return (
    <section id="faq" className="py-24 relative border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader
          tag="FAQ"
          title="Frequently Asked Questions"
          description="Have questions about how DevVerse functions? Here are clarification points covering communities, showcase setups, and features."
        />

        <div className="border-t border-zinc-900 mt-10">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ───────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 relative border-t border-zinc-900 bg-zinc-950/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 md:p-16 text-center max-w-5xl mx-auto overflow-hidden shadow-2xl"
        >
          {/* Decorative glowing gradient blobs */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            Ready to join the developer community?
          </h2>
          <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Create your account to start linking repositories, building your portfolio, joining channels, and coordinating codebases with engineers.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
              <Link
                href="/sign-up"
                className="relative inline-flex items-center gap-2 px-8 py-4.5 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-100 transition-colors shadow-lg"
              >
                Create free account
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────
function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Why DevVerse", href: "#why-devverse" },
        { label: "Communities", href: "#communities" },
        { label: "Projects", href: "#projects" },
        { label: "Events", href: "#events" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Blog", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "System Status", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Contact Support", href: "#" }
      ]
    }
  ];

  return (
    <footer className="relative border-t border-zinc-900 bg-[#09090B] pt-20 pb-10 z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Code2 size={16} className="text-white" />
              </div>
              <span className="font-black text-lg text-white">DevVerse</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              The modern social network platform built specifically for developers. Re-representing portfolios, repositories, and technical spaces.
            </p>
            <div className="flex gap-4">
              {[
                { icon: GithubIcon, href: "#", label: "GitHub" },
                { icon: TwitterIcon, href: "#", label: "Twitter" },
                { icon: LinkedinIcon, href: "#", label: "LinkedIn" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900/30 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-5">
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>© 2026 DevVerse. All rights reserved.</p>
          <p>Made with ❤️ for developers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN LANDING PAGE ───────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white bg-[#09090B] font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Background patterns and glowing lights */}
      <BackgroundLayers />

      {/* Navigation */}
      <LandingNav />

      {/* Main Page Sections */}
      <main className="relative z-10">
        <HeroSection />
        
        <StatsSection />


        {/* Replaced dashboard preview location */}
        <div className="relative z-25 -mt-10 sm:-mt-14">
          <DashboardPreview />
        </div>

        {/* Feature Grid */}
        <FeaturesHighlights />

        {/* Why DevVerse Value proposition */}
        <WhyDevVerse />

        {/* Roadmap/Timeline Journey */}
        <DeveloperJourney />



        {/* FAQs */}
        <FAQSection />

        {/* Call To Action */}
        <CTASection />
      </main>

      {/* Large Premium Footer */}
      <Footer />
    </div>
  );
}
