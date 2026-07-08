"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useTheme } from "next-themes";
import { User, Bell, Shield, Palette, Save, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [devRole, setDevRole] = useState("Frontend Engineer");

  return (
    <div style={{ paddingTop: 24, maxWidth: 640 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Settings</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Settings Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <User size={16} style={{ color: "var(--accent)" }} />
            Developer Profile
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Primary Developer Role</label>
              <select
                id="dev-role-select"
                value={devRole}
                onChange={(e) => setDevRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  color: "var(--primary)",
                  outline: "none",
                }}
              >
                <option>Frontend Engineer</option>
                <option>Backend Engineer</option>
                <option>Full Stack Developer</option>
                <option>DevOps Engineer</option>
                <option>UI/UX Developer</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Custom Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Palette size={16} style={{ color: "var(--accent)" }} />
            Appearance
          </h2>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 8 }}>Interface Theme</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { id: "light", label: "🌞 Light" },
                { id: "dark", label: "🌙 Dark" },
                { id: "system", label: "💻 System" },
              ].map((t) => (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => setTheme(t.id)}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${theme === t.id ? "var(--accent)" : "var(--border)"}`,
                    background: theme === t.id ? "var(--accent-muted)" : "var(--background)",
                    color: theme === t.id ? "var(--accent)" : "var(--primary)",
                    fontSize: 13,
                    fontWeight: theme === t.id ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Bell size={16} style={{ color: "var(--accent)" }} />
            Notification Preferences
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { id: "likes", label: "Likes on my posts/projects", value: notifyLikes, setter: setNotifyLikes },
              { id: "comments", label: "Comments on my discussions", value: notifyComments, setter: setNotifyComments },
              { id: "follows", label: "New followers", value: notifyFollows, setter: setNotifyFollows },
            ].map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--secondary)" }}>{item.label}</span>
                <input
                  id={`notify-toggle-${item.id}`}
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.setter(e.target.checked)}
                  style={{
                    width: 36,
                    height: 18,
                    borderRadius: 9,
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Log Out */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Sign Out</h2>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Logout of your active session</p>
          </div>
          <button
            id="signout-btn"
            onClick={() => signOut()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius)",
              fontSize: 12,
              fontWeight: 600,
              color: "#EF4444",
              cursor: "pointer",
              transition: "background 150ms",
            }}
            className="hover:bg-danger/15"
          >
            <LogOut size={13} />
            Log Out
          </button>
        </motion.div>

        {/* Save button */}
        <button
          id="save-settings-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 20px",
            background: "var(--accent)",
            border: "none",
            borderRadius: "var(--radius)",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            cursor: "pointer",
            width: "100%",
            transition: "opacity 150ms",
          }}
          className="hover:opacity-85"
        >
          <Save size={15} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
