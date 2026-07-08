"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Save, User, Globe, MapPin, Briefcase, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const skillOptions = ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Kubernetes", "GraphQL", "Python", "Go", "Rust", "Swift"];

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Alex Chen");
  const [headline, setHeadline] = useState("Senior Frontend Engineer at Vercel");
  const [bio, setBio] = useState("Full Stack Engineer passionate about building beautiful, performant web applications. Open source contributor. TypeScript & React enthusiast.");
  const [location, setLocation] = useState("San Francisco, CA");
  const [website, setWebsite] = useState("alexchen.dev");
  const [skills, setSkills] = useState(["TypeScript", "React", "Next.js", "Node.js"]);
  const [customSkill, setCustomSkill] = useState("");

  const handleAddSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save success
    router.push("/profile/alex_chen");
  };

  return (
    <div style={{ paddingTop: 24, maxWidth: 640 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Edit Profile</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Update your public profile details and skills
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Full Name</label>
            <input
              id="edit-profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Headline</label>
            <input
              id="edit-profile-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
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
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Bio</label>
            <textarea
              id="edit-profile-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 13,
                color: "var(--primary)",
                outline: "none",
                resize: "none",
              }}
            />
          </div>
        </motion.div>

        {/* Extended Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                <MapPin size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                Location
              </label>
              <input
                id="edit-profile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                <Globe size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                Website
              </label>
              <input
                id="edit-profile-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
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
              />
            </div>
          </div>
        </motion.div>

        {/* Skills Settings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Skills & Technologies</h2>

          {/* Active Skills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  background: "var(--accent-muted)",
                  color: "var(--accent)",
                  borderRadius: "var(--radius-full)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {skill}
                <X size={12} style={{ cursor: "pointer" }} onClick={() => handleRemoveSkill(skill)} />
              </span>
            ))}
          </div>

          {/* Add Skill */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="custom-skill-input"
              type="text"
              placeholder="Add skill (e.g. Next.js, Rust)"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 13,
                color: "var(--primary)",
                outline: "none",
              }}
            />
            <button
              id="add-skill-btn"
              type="button"
              onClick={handleAddSkill}
              style={{
                padding: "8px 16px",
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--primary)",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>
        </motion.div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link
            href="/profile/alex_chen"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "transparent",
              color: "var(--secondary)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>
          <button
            id="save-profile-btn"
            type="submit"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
            }}
          >
            <Save size={15} />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
