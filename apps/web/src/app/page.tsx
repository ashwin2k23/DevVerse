"use client";

import { motion, Variants, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Users,
  Zap,
  Star,
  Globe,
  GitBranch,
  Trophy,
  MessageSquare,
  Rocket,
  TrendingUp,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Github, Twitter, Linkedin } from "@/components/shared/BrandIcons";
import {
  SquiggleUnderline,
  HighlightCircle,
  CurlyArrow,
  StarSparkle,
  CurlyBracketsDoodle,
  CodeBracketsDoodle,
  CoffeeMugDoodle,
  LightbulbDoodle,
} from "@/components/shared/Doodles";

// ΓöÇΓöÇΓöÇ Animation variants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ΓöÇΓöÇΓöÇ Data ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const features = [
  {
    icon: Code2,
    title: "Project Showcase",
    description:
      "Display your work with beautiful galleries, live demo links, GitHub integration, and rich tech stack tags.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
  },
  {
    icon: Users,
    title: "Developer Communities",
    description:
      "Join topic-based communities for React, Flutter, DevOps, UI/UX, and more. Post, discuss, and grow together.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-500",
  },
  {
    icon: Zap,
    title: "Realtime Messaging",
    description:
      "Chat with developers in real-time. Typing indicators, read receipts, attachments, and emoji support.",
    color: "from-yellow-500/20 to-yellow-600/5",
    iconColor: "text-yellow-500",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Earn badges, maintain daily streaks, climb developer levels, and get featured on the leaderboard.",
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-500",
  },
  {
    icon: Globe,
    title: "Events & Hackathons",
    description:
      "Discover and register for upcoming hackathons, meetups, workshops, and webinars worldwide.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: Star,
    title: "Developer Portfolio",
    description:
      "Every account gets a beautiful public portfolio at devverse.app/username with projects and achievements.",
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-500",
  },
];

const stats = [
  { value: "50K+", label: "Developers" },
  { value: "12K+", label: "Projects" },
  { value: "800+", label: "Communities" },
  { value: "200+", label: "Events Monthly" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    company: "Vercel",
    avatar: "SC",
    content:
      "DevVerse completely changed how I connect with other developers. Found my current job through a community post here.",
    color: "from-blue-500 to-violet-500",
  },
  {
    name: "Marcus Rodriguez",
    role: "Full Stack Developer",
    company: "Linear",
    avatar: "MR",
    content:
      "The project showcase feature is incredible. Got 3 job offers just from sharing my open-source work here.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Priya Sharma",
    role: "DevOps Engineer",
    company: "Stripe",
    avatar: "PS",
    content:
      "Best developer community I've ever been part of. The quality of discussions and events is unmatched.",
    color: "from-orange-500 to-red-500",
  },
];

const floatingCards = [
  { icon: GitBranch, text: "Just shipped v2.0!", user: "alex_dev", time: "2m ago", color: "text-emerald-500" },
  { icon: Star, text: "Project got 1K stars! ≡ƒÄë", user: "sarah_codes", time: "5m ago", color: "text-yellow-500" },
  { icon: Trophy, text: "Won the hackathon!", user: "marcus_r", time: "1h ago", color: "text-orange-500" },
];

// ΓöÇΓöÇΓöÇ Navbar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "3px solid var(--primary)",
        }}
        className="dark:bg-[rgba(9,9,11,0.9)]"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [-5, 5, -5, 0], scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--primary)",
                boxShadow: "2px 2px 0px var(--primary)",
              }}
            >
              <Code2 size={16} color="white" strokeWidth={2.5} />
            </motion.div>
            <span
              className="font-cartoon font-bold text-lg hover:text-accent transition-colors"
              style={{ letterSpacing: "-0.01em" }}
            >
              DevVerse
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {["Features", "Communities", "Events", "Developers"].map((item) => {
              const href = item === "Features" ? "#features" : item === "Developers" ? "#" : `/${item.toLowerCase()}`;
              return (
                <Link
                  key={item}
                  href={href}
                  style={{ color: "var(--secondary)", fontSize: 13, fontWeight: 600 }}
                  className="font-cartoon hover:text-primary transition-colors duration-150 relative group"
                >
                  {item}
                  <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
              }}
              className="cartoon-btn hover:bg-surface hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 18px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              className="cartoon-btn cartoon-btn-accent"
            >
              Get started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// ΓöÇΓöÇΓöÇ Hero ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function HeroSection() {
  return (
    <section
      className="hero-gradient mesh-gradient"
      style={{ paddingTop: 140, paddingBottom: 100, position: "relative", overflow: "hidden" }}
    >
      {/* Background Animated Doodles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <CodeBracketsDoodle className="absolute left-[7%] top-[20%]" delay={0.2} />
        <LightbulbDoodle className="absolute right-[8%] top-[18%]" delay={0.4} />
        <CoffeeMugDoodle className="absolute left-[10%] bottom-[20%]" delay={0.6} />
        <CurlyBracketsDoodle className="absolute right-[8%] bottom-[15%]" delay={0.8} />
        <StarSparkle className="absolute left-[45%] top-[12%]" delay={0.5} />
        <StarSparkle className="absolute right-[30%] bottom-[28%]" delay={0.7} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center" style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            style={{ display: "inline-flex", marginBottom: 24 }}
          >
            <span className="cartoon-badge" style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Rocket size={12} />
              The Developer Social Network
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-cartoon"
            style={{
              fontSize: "clamp(38px, 5.5vw, 68px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: 24,
              color: "var(--primary)",
            }}
          >
            Where Developers
            <br />
            <span className="relative inline-block px-1">
              <span className="gradient-text relative z-10">Connect & Build</span>
              <SquiggleUnderline color="var(--accent)" delay={0.7} />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{
              fontSize: 17,
              color: "var(--secondary)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 580,
              margin: "0 auto 40px",
            }}
          >
            Showcase projects, connect with brilliant developers, join communities, 
            and accelerate your career ΓÇö all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}
          >
            <div style={{ position: "relative" }}>
              <Link
                href="/sign-up"
                className="cartoon-btn cartoon-btn-accent"
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "14px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
              {/* Handwritten Curly Arrow pointing to Start for Free */}
              <CurlyArrow
                text="Free forever! ≡ƒÜÇ"
                textOffset={{ x: -100, y: -25 }}
                rotation={-15}
                delay={1.1}
                className="absolute left-[-110px] top-[-30px] hidden lg:block"
              />
            </div>
            <Link
              href="/explore"
              className="cartoon-btn"
              style={{
                fontWeight: 600,
                fontSize: 15,
                padding: "14px 28px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Explore developers
              <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ marginTop: 32, color: "var(--muted)", fontSize: 13 }}
            className="font-cartoon"
          >
            Trusted by{" "}
            <strong style={{ color: "var(--secondary)" }}>50,000+</strong> developers worldwide
          </motion.p>
        </div>

        {/* Dashboard Preview Section */}
        <div style={{ position: "relative", marginTop: 80, height: 420 }} className="mb-20 sm:mb-10">
          {/* Main dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="cartoon-box"
            style={{
              maxWidth: 900,
              margin: "0 auto",
              overflow: "hidden",
              borderWidth: 3,
            }}
          >
            {/* Window bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 16px",
                borderBottom: "3px solid var(--primary)",
                background: "var(--background)",
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57", border: "1.5px solid var(--primary)" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E", border: "1.5px solid var(--primary)" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840", border: "1.5px solid var(--primary)" }} />
              <div
                className="font-cartoon font-semibold"
                style={{
                  flex: 1,
                  marginLeft: 8,
                  background: "var(--surface-elevated)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 11,
                  color: "var(--muted)",
                  border: "1.5px solid var(--primary)",
                  textAlign: "center",
                }}
              >
                devverse.app/dashboard
              </div>
            </div>

            {/* Dashboard preview body */}
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
              {/* Sidebar preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Dashboard", "Feed", "Projects", "Communities", "Events", "Messages"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className="font-cartoon"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: i === 0 ? "var(--accent-muted)" : "transparent",
                        color: i === 0 ? "var(--accent)" : "var(--secondary)",
                        fontSize: 13,
                        fontWeight: 700,
                        border: i === 0 ? "2px solid var(--primary)" : "2px solid transparent",
                        boxShadow: i === 0 ? "2px 2px 0px var(--primary)" : "none",
                      }}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>

              {/* Content preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginBottom: 4,
                  }}
                >
                  {[
                    { label: "Followers", value: "2.4K" },
                    { label: "Projects", value: "12" },
                    { label: "Streak", value: "≡ƒöÑ 14" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="relative overflow-visible"
                      style={{
                        background: "var(--background)",
                        border: "2px solid var(--primary)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        boxShadow: "3px 3px 0px var(--primary)",
                      }}
                    >
                      <div className="font-cartoon font-bold" style={{ fontSize: 16 }}>{stat.value}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                        {stat.label}
                      </div>

                      {/* Accent Highlight Circle over Streak */}
                      {stat.label === "Streak" && (
                        <HighlightCircle color="var(--warning)" delay={1.6} />
                      )}
                    </div>
                  ))}
                </div>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--background)",
                      border: "2px solid var(--primary)",
                      borderRadius: 10,
                      padding: 12,
                      height: 56,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      boxShadow: "3px 3px 0px var(--primary)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: i === 1 ? "linear-gradient(135deg,#2563EB,#7C3AED)" : "linear-gradient(135deg,#10B981,#0D9488)",
                        border: "2.5px solid var(--primary)",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          height: 10,
                          width: 120,
                          background: "var(--border)",
                          borderRadius: 4,
                          marginBottom: 6,
                          border: "1px solid var(--primary)",
                        }}
                      />
                      <div
                        style={{
                          height: 8,
                          width: 80,
                          background: "var(--border-subtle)",
                          borderRadius: 4,
                          border: "1px solid var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating notification cards */}
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              className="animate-float hidden xl:flex cartoon-box"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
              style={{
                position: "absolute",
                ...(i === 0
                  ? { left: "calc(50% - 490px)", top: 15 }
                  : i === 1
                  ? { right: "calc(50% - 490px)", top: 50 }
                  : { left: "calc(50% - 530px)", bottom: -30 }),
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                whiteSpace: "nowrap",
                animationDelay: `${i * 1.2}s`,
                borderWidth: 3,
                boxShadow: "4px 4px 0px var(--primary)",
              }}
            >
              <card.icon size={16} className={card.color} style={{ filter: "drop-shadow(1.5px 1.5px 0px var(--primary))" }} />
              <div>
                <div className="font-cartoon text-sm font-bold">{card.text}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  @{card.user} ┬╖ {card.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ΓöÇΓöÇΓöÇ Stats ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function StatsSection() {
  return (
    <section style={{ padding: "80px 0", borderTop: "3px solid var(--primary)", borderBottom: "3px solid var(--primary)", background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}
          className="grid-cols-2 sm:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="cartoon-box"
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                textAlign: "center",
                padding: "24px 16px",
                borderWidth: 3,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                className="font-cartoon font-extrabold"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  color: "var(--primary)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="font-cartoon text-sm font-bold"
                style={{ color: "var(--secondary)", marginTop: 4 }}
              >
                {stat.label}
              </div>

              {/* Little sparkle doodle over the first stat card */}
              {i === 0 && (
                <StarSparkle className="absolute -top-3.5 -right-3.5" delay={0.5} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ΓöÇΓöÇΓöÇ Features ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function FeaturesSection() {
  const tilts = ["-1.5deg", "1.5deg", "-1deg", "2deg", "-2deg", "1deg"];

  return (
    <section id="features" style={{ padding: "100px 0", position: "relative" }} className="bg-surface/50">
      {/* Background doodles */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10 overflow-hidden">
        <CoffeeMugDoodle className="absolute right-[12%] top-[10%]" delay={0.4} />
        <CodeBracketsDoodle className="absolute left-[8%] bottom-[8%]" delay={0.6} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <motion.p
            variants={fadeUp}
            className="font-cartoon"
            style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}
          >
            Everything you need
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-cartoon"
            style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, color: "var(--primary)" }}
          >
            Built for modern developers
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{ marginTop: 16, fontSize: 16, color: "var(--secondary)", maxWidth: 520, margin: "16px auto 0" }}
          >
            Every feature is crafted to help you grow, connect, and showcase your best work.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              custom={i}
              variants={fadeUp}
              whileHover={{
                scale: 1.03,
                y: -6,
                rotate: i % 2 === 0 ? 1 : -1,
                transition: { type: "spring", stiffness: 350, damping: 12 },
              }}
              className="cartoon-box"
              style={{
                background: "var(--surface)",
                borderWidth: 3,
                borderRadius: "var(--radius-lg)",
                padding: 28,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transform: `rotate(${tilts[i % tilts.length]})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 120,
                  background: `linear-gradient(180deg, ${feat.color.split(" ")[0].replace("from-", "")} 0%, transparent 100%)`,
                  opacity: 0.35,
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--background)",
                  border: "2px solid var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  position: "relative",
                  boxShadow: "2.5px 2.5px 0px var(--primary)",
                }}
              >
                <feat.icon size={20} className={feat.iconColor} style={{ filter: "drop-shadow(1px 1px 0px var(--primary))" }} />
              </div>
              <h3 className="font-cartoon" style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, position: "relative" }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.6, position: "relative" }}>
                {feat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ΓöÇΓöÇΓöÇ Testimonials ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function TestimonialsSection() {
  return (
    <section
      style={{ padding: "100px 0", background: "var(--surface)", borderTop: "3px solid var(--primary)", borderBottom: "3px solid var(--primary)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <motion.p
            variants={fadeUp}
            className="font-cartoon"
            style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}
          >
            Testimonials
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-cartoon"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--primary)" }}
          >
            Loved by developers worldwide
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeUp}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Comic Speech Bubble */}
              <motion.div
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  transition: { type: "spring", stiffness: 350, damping: 15 },
                }}
                className="cartoon-box"
                style={{
                  background: "var(--background)",
                  borderWidth: 3,
                  borderRadius: "var(--radius-lg)",
                  padding: 24,
                  position: "relative",
                  flex: 1,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p className="font-cartoon text-sm font-medium" style={{ color: "var(--primary)", lineHeight: 1.6 }}>
                  "{t.content}"
                </p>
                {/* Bubble tail pointing down */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -9,
                    left: 32,
                    width: 16,
                    height: 16,
                    background: "var(--background)",
                    borderRight: "3px solid var(--primary)",
                    borderBottom: "3px solid var(--primary)",
                    transform: "rotate(45deg)",
                  }}
                />
              </motion.div>

              {/* Author Details (Below bubble) */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.color})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                    border: "2px solid var(--primary)",
                    boxShadow: "2px 2px 0px var(--primary)",
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-cartoon text-sm font-extrabold" style={{ color: "var(--primary)" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--secondary)" }}>
                    {t.role} ┬╖ {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ΓöÇΓöÇΓöÇ CTA ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function CTASection() {
  return (
    <section style={{ padding: "100px 0", position: "relative" }} className="bg-background">
      {/* Background doodles */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10 overflow-hidden">
        <LightbulbDoodle className="absolute left-[10%] top-[20%]" delay={0.2} />
        <StarSparkle className="absolute right-[12%] top-[15%]" delay={0.4} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="cartoon-box text-white"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #7C3AED 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "80px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            borderWidth: 3,
            borderColor: "var(--primary)",
          }}
        >
          {/* Background decoration bubbles */}
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -80,
              left: -30,
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          />

          <motion.h2
            variants={fadeUp}
            className="font-cartoon"
            style={{
              fontSize: "clamp(28px, 4.5vw, 46px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "white",
              marginBottom: 16,
              position: "relative",
            }}
          >
            Ready to join the community?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 40,
              maxWidth: 480,
              margin: "0 auto 40px",
              position: "relative",
            }}
          >
            Join 50,000+ developers already building, connecting, and growing on DevVerse.
          </motion.p>
          <motion.div
            variants={fadeUp}
            style={{ display: "flex", gap: 12, justifyContent: "center", position: "relative" }}
          >
            <div style={{ position: "relative" }}>
              <Link
                href="/sign-up"
                className="cartoon-btn"
                style={{
                  background: "white",
                  color: "#2563EB",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "14px 32px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Create free account
                <ArrowRight size={16} />
              </Link>

              {/* Curly arrow pointing to button */}
              <CurlyArrow
                text="Takes 30 seconds! ΓÜí"
                color="white"
                textOffset={{ x: 30, y: -25 }}
                rotation={120}
                delay={0.8}
                className="absolute right-[-140px] top-[15px] hidden lg:block"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ΓöÇΓöÇΓöÇ Footer ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function Footer() {
  return (
    <footer
      style={{
        borderTop: "3px solid var(--primary)",
        padding: "60px 0 40px",
        background: "var(--surface)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }} className="grid-cols-1 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--primary)",
                  boxShadow: "2px 2px 0px var(--primary)",
                }}
              >
                <Code2 size={16} color="white" strokeWidth={2.5} />
              </div>
              <span className="font-cartoon font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>DevVerse</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--secondary)", lineHeight: 1.7, maxWidth: 280 }}>
              The modern social platform for developers. Build, connect, and grow together.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "var(--background)",
                    border: "2px solid var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--secondary)",
                    boxShadow: "2px 2px 0px var(--primary)",
                    transition: "all 150ms",
                  }}
                  className="hover:text-accent hover:-translate-y-0.5"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: ["Dashboard", "Explore", "Communities", "Events", "Messages"],
            },
            {
              title: "Developers",
              links: ["Documentation", "API", "Status", "Changelog"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Privacy", "Terms"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-cartoon font-bold text-sm" style={{ marginBottom: 16 }}>{col.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <Link
                    key={link}
                    href={`/${link.toLowerCase()}`}
                    style={{ fontSize: 13, color: "var(--secondary)", transition: "color 150ms" }}
                    className="font-cartoon hover:text-primary"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "2px solid var(--primary)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--muted)" }} className="font-cartoon">
            ┬⌐ 2026 DevVerse. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)" }} className="font-cartoon">
            Made with Γ¥ñ∩╕Å for developers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

// ΓöÇΓöÇΓöÇ Main Page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: "linear-gradient(90deg, var(--accent) 0%, #7C3AED 50%, #FF007F 100%)",
          transformOrigin: "0%",
          zIndex: 100,
        }}
      />
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
