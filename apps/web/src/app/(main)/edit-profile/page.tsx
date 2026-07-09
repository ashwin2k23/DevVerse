"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Save, Globe, MapPin, Loader2, Image, User, X, Camera } from "lucide-react";
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
  const [savedUsername, setSavedUsername] = useState("");

  // Social links
  const [instagram, setInstagram] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [threads, setThreads] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");

  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userLoaded || !currentUser || hasLoadedProfile) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Always use /me/profile to fetch by clerkId, avoiding username mismatch 404s
        const res = await authApi.get("/users/me/profile");
        if (res.data?.success && res.data?.data) {
          const profileData = res.data.data;
          setUsernameState(profileData.username || "");
          setSavedUsername(profileData.username || "");
          setBio(profileData.bio || "");
          setAvatarUrl(profileData.avatarUrl || "");
          setCoverUrl(profileData.coverUrl || "");
          setHeadline(profileData.profile?.headline || "");
          setLocation(profileData.profile?.location || "");
          setWebsite(profileData.profile?.website || "");
          setSkills(profileData.userSkills?.map((us: any) => us.skill.name) || []);
          // Populate social links
          const socials: any[] = profileData.socialLinks || [];
          const findUrl = (platform: string) =>
            socials.find((s: any) => s.platform?.toLowerCase().includes(platform))?.url || "";
          setInstagram(findUrl("instagram"));
          setTwitterLink(findUrl("twitter"));
          setThreads(findUrl("threads"));
          setGithubLink(findUrl("github"));
          setLinkedinLink(findUrl("linkedin"));
          setHasLoadedProfile(true);
        } else {
          setError("Failed to load profile data.");
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err?.response?.data?.message || "Error fetching profile details.");
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
          if (data?.address) {
            const { city, town, village, suburb, state, country } = data.address;
            const cityName = city || town || village || suburb || "";
            const resolvedLocation = cityName
              ? `${cityName}, ${state || country}`
              : state
              ? `${state}, ${country}`
              : country;
            if (resolvedLocation) setLocation(resolvedLocation);
            else alert("Could not resolve a readable location name.");
          } else {
            alert("Failed to resolve your coordinates.");
          }
        } catch {
          alert("Error fetching location from reverse geocoding.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        alert(err.code === 1 ? "Location permission denied." : "Could not retrieve your location.");
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authApi.post("/upload?folder=devverse/avatars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success && res.data?.url) {
        setAvatarUrl(res.data.url);
      }
    } catch {
      alert("Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      // Reset file input so same file can be selected again
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
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
      const socialLinks: { platform: string; url: string }[] = [];
      if (instagram.trim())    socialLinks.push({ platform: "Instagram",  url: instagram.trim() });
      if (twitterLink.trim())  socialLinks.push({ platform: "Twitter",    url: twitterLink.trim() });
      if (threads.trim())      socialLinks.push({ platform: "Threads",    url: threads.trim() });
      if (githubLink.trim())   socialLinks.push({ platform: "GitHub",     url: githubLink.trim() });
      if (linkedinLink.trim()) socialLinks.push({ platform: "LinkedIn",   url: linkedinLink.trim() });

      const res = await authApi.put("/users/me", {
        username: usernameState.trim(),
        bio,
        headline,
        location,
        website,
        avatarUrl,
        coverUrl,
        skills,
        socialLinks,
      });

      if (res.data?.success) {
        router.push(`/profile/${usernameState.trim()}`);
      } else {
        setError("Failed to update profile.");
      }
    } catch (err: any) {
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

  const localCurrentUsername = savedUsername || currentUser?.username || "me";

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
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #EF4444", color: "#EF4444", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Profile Photo + Cover */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 16 }}>
            Profile Photo & Cover
          </h2>

          {/* Avatar Preview & Upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: avatarUrl ? "transparent" : "linear-gradient(135deg, #2563EB, #7C3AED)",
                border: "3px solid var(--border)", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>
                      {usernameState.slice(0, 2).toUpperCase() || "?"}
                    </span>
                }
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "var(--accent)", border: "2px solid var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: uploadingAvatar ? "not-allowed" : "pointer",
                  color: "white",
                }}
              >
                {uploadingAvatar
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Camera size={12} />
                }
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginBottom: 4 }}>Profile Photo</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Click the camera icon to upload a new photo from your computer.</p>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  padding: "6px 14px", background: "var(--surface-elevated)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  fontSize: 12, fontWeight: 600, color: "var(--primary)",
                  cursor: uploadingAvatar ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
              >
                {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                {uploadingAvatar ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </div>

          {/* Cover Image URL */}
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
              placeholder="e.g. https://... or linear-gradient(135deg, #1e3a5f, #0f1923)"
              style={{
                width: "100%", padding: "9px 12px",
                background: "var(--background)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none",
              }}
            />
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>
              Enter an image URL or a CSS gradient. The cover can also be changed directly from your profile page.
            </p>
          </div>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>Basic Info</h2>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
              <User size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
              Username
            </label>
            <input
              id="edit-profile-username"
              type="text"
              required
              value={usernameState}
              onChange={(e) => setUsernameState(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none" }}
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
              style={{ width: "100%", padding: "9px 12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none" }}
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
              style={{ width: "100%", padding: "9px 12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none", resize: "none" }}
            />
          </div>
        </motion.div>

        {/* Links & Context */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>Links & Context</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                <MapPin size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                Location
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  id="edit-profile-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  style={{ flex: 1, padding: "9px 12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none" }}
                />
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={fetchingLocation}
                  title="Fetch your live location"
                  style={{
                    padding: "8px 10px", background: "var(--surface-elevated)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius)", fontSize: 12, fontWeight: 600,
                    color: fetchingLocation ? "var(--muted)" : "var(--accent)",
                    cursor: fetchingLocation ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                  }}
                >
                  {fetchingLocation ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                </button>
              </div>
              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Click 📍 to auto-fill from GPS</p>
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
                style={{ width: "100%", padding: "9px 12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Skills & Technologies</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {skills.length === 0
              ? <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No skills added yet.</span>
              : skills.map((skill) => (
                  <span key={skill} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", background: "var(--accent-muted)", color: "var(--accent)", borderRadius: "var(--radius-full)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {skill}
                    <X size={12} style={{ cursor: "pointer" }} onClick={() => handleRemoveSkill(skill)} />
                  </span>
                ))
            }
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="custom-skill-input"
              type="text"
              placeholder="Add skill (e.g. Next.js, Rust)"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
              style={{ flex: 1, padding: "8px 12px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none" }}
            />
            <button
              id="add-skill-btn"
              type="button"
              onClick={handleAddSkill}
              style={{ padding: "8px 16px", background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 600, color: "var(--primary)", cursor: "pointer" }}
            >
              Add
            </button>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>Social Links</h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: -8 }}>Add your social profiles. They'll appear as clickable icons on your public profile.</p>

          {[
            { id: "edit-instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle", value: instagram, onChange: setInstagram },
            { id: "edit-twitter",   label: "Twitter / X", placeholder: "https://x.com/yourhandle", value: twitterLink, onChange: setTwitterLink },
            { id: "edit-threads",   label: "Threads",   placeholder: "https://threads.net/@yourhandle", value: threads,     onChange: setThreads },
            { id: "edit-github",    label: "GitHub",    placeholder: "https://github.com/yourusername", value: githubLink,  onChange: setGithubLink },
            { id: "edit-linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/in/yourprofile", value: linkedinLink, onChange: setLinkedinLink },
          ].map(({ id, label, placeholder, value, onChange }) => (
            <div key={id}>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>{label}</label>
              <input
                id={id}
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%", padding: "9px 12px",
                  background: "var(--background)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", fontSize: 13, color: "var(--primary)", outline: "none",
                }}
              />
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link
            href={localCurrentUsername ? `/profile/${localCurrentUsername}` : "/dashboard"}
            style={{ flex: 1, textAlign: "center", padding: "10px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "transparent", color: "var(--secondary)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
          >
            Cancel
          </Link>
          <button
            id="save-profile-btn"
            type="submit"
            disabled={saving}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", background: "var(--accent)", border: "none", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 600, color: "white", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
