"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Save, Globe, MapPin, Loader2, Image, User, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { user: currentUser, isLoaded: userLoaded } = useUser();
  const authApi = useApiClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Form States
  const [usernameState, setUsernameState] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const localCurrentUsername =
    currentUser?.username ||
    currentUser?.emailAddresses?.[0]?.emailAddress?.split("@")?.[0] ||
    currentUser?.id;

  useEffect(() => {
    if (!userLoaded || !currentUser || hasLoadedProfile) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await authApi.get(`/users/${localCurrentUsername}`);
        if (res.data?.success && res.data?.data) {
          const profileData = res.data.data;
          setUsernameState(profileData.username || "");
          setBio(profileData.bio || "");
          setAvatarUrl(profileData.avatarUrl || "");
          setCoverUrl(profileData.coverUrl || "");
          setHeadline(profileData.profile?.headline || "");
          setLocation(profileData.profile?.location || "");
          setWebsite(profileData.profile?.website || "");
          setSkills(profileData.userSkills?.map((us: any) => us.skill.name) || []);
          setHasLoadedProfile(true);
        } else {
          setError("Failed to load profile data.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error fetching profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userLoaded, currentUser, hasLoadedProfile]);

  const handleAddSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.address) {
            const address = data.address;
            const city = address.city || address.town || address.village || address.suburb || "";
            const state = address.state || "";
            const country = address.country || "";

            let resolvedLocation = "";
            if (city) {
              resolvedLocation = `${city}, ${state || country}`;
            } else if (state) {
              resolvedLocation = `${state}, ${country}`;
            } else {
              resolvedLocation = country;
            }

            if (resolvedLocation) {
              setLocation(resolvedLocation);
            } else {
              alert("Location resolved, but details are empty.");
            }
          } else {
            alert("Failed to resolve your coordinates to a location name.");
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          alert("Error fetching location details from reverse geocoding service.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(
          error.code === 1
            ? "Location permission denied. Please allow location access."
            : "Could not retrieve your location."
        );
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameState.trim()) {
      setError("Username cannot be empty");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await authApi.put("/users/me", {
        username: usernameState.trim(),
        bio,
        headline,
        location,
        website,
        avatarUrl,
        coverUrl,
        skills,
      });

      if (res.data?.success) {
        router.push(`/profile/${usernameState.trim()}`);
      } else {
        setError("Failed to update profile.");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!userLoaded || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 24, maxWidth: 640, paddingBottom: 60 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Edit Profile</h1>
        <p style={{ color: "var(--secondary)", fontSize: 14, marginTop: 4 }}>
          Update your public profile details, profile assets, and skills
        </p>
      </motion.div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #EF4444", color: "#EF4444", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

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
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>Basic Info</h2>
          
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
            <input
              id="edit-profile-username"
              type="text"
              required
              value={usernameState}
              onChange={(e) => setUsernameState(e.target.value)}
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
              placeholder="e.g. Senior Frontend Engineer at Vercel"
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
              placeholder="Tell other developers about yourself..."
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

        {/* Profile Assets */}
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
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>Profile Design Assets</h2>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
              <User size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
              Avatar URL
            </label>
            <input
              id="edit-profile-avatar"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
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
              <Image size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
              Cover Image URL
            </label>
            <input
              id="edit-profile-cover"
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="e.g. linear-gradient(135deg, #1e3a5f, #0f1923) or absolute URL"
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
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>Links & Context</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                <MapPin size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                Location
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="edit-profile-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                    color: "var(--primary)",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={fetchingLocation}
                  style={{
                    padding: "8px 12px",
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--primary)",
                    cursor: fetchingLocation ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {fetchingLocation ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <MapPin size={12} style={{ color: "var(--accent)" }} />
                  )}
                  {fetchingLocation ? "Locating..." : "Get GPS"}
                </button>
              </div>
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
                placeholder="e.g. myportfolio.com"
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
            {skills.length === 0 ? (
              <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No skills added yet.</span>
            ) : (
              skills.map((skill) => (
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
              ))
            )}
          </div>

          {/* Add Skill */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="custom-skill-input"
              type="text"
              placeholder="Add skill (e.g. Next.js, Rust)"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
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
            href={localCurrentUsername ? `/profile/${localCurrentUsername}` : "/dashboard"}
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
            disabled={saving}
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
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
