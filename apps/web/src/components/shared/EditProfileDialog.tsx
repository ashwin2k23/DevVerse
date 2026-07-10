"use client";

import * as React from "react";
import { useState, useEffect, useRef, useId } from "react";
import { useUser } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCharacterLimit } from "../hooks/use-character-limit";
import {
  Check,
  ImagePlus,
  X,
  Globe,
  MapPin,
  Loader2,
  Camera,
} from "lucide-react";

interface EditProfileDialogProps {
  profile: any;
  trigger: React.ReactNode;
  onSuccess: (updatedUser: any) => void;
}

export function EditProfileDialog({ profile, trigger, onSuccess }: EditProfileDialogProps) {
  const id = useId();
  const authApi = useApiClient();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [usernameState, setUsernameState] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  // Social Links States
  const [instagram, setInstagram] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [threads, setThreads] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");

  // Upload and Location fetch states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Biography Character Limit Hook integration
  const maxLength = 180;
  const {
    value: bioValue,
    characterCount,
    handleChange: handleBioChange,
    setValue: setBioValue,
  } = useCharacterLimit({
    maxLength,
    initialValue: profile?.bio || "",
  });

  // Initialize fields when dialog opens or profile changes
  useEffect(() => {
    if (!profile) return;
    setUsernameState(profile.username || "");
    setHeadline(profile.profile?.headline || "");
    setBioValue(profile.bio || "");
    setLocation(profile.profile?.location || "");
    setWebsite(profile.profile?.website || "");
    setAvatarUrl(profile.avatarUrl || "");
    setCoverUrl(profile.coverUrl || "");
    setSkills(profile.userSkills?.map((us: any) => us.skill?.name).filter(Boolean) || []);

    const socials = profile.socialLinks || [];
    const findUrl = (platform: string) =>
      socials.find((s: any) => s.platform?.toLowerCase().includes(platform))?.url || "";

    setInstagram(findUrl("instagram"));
    setTwitterLink(findUrl("twitter"));
    setThreads(findUrl("threads"));
    setGithubLink(findUrl("github"));
    setLinkedinLink(findUrl("linkedin"));
  }, [profile, open, setBioValue]);

  // Skill Handlers
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Image Upload Handlers
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
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authApi.post("/upload?folder=devverse/covers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success && res.data?.url) {
        setCoverUrl(res.data.url);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Geolocation Handler
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
            else alert("Could not resolve location.");
          } else {
            alert("Failed to resolve coordinates.");
          }
        } catch (err) {
          console.error(err);
          alert("Error fetching location.");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        alert(err.code === 1 ? "Permission denied." : "Could not retrieve location.");
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Form Submit Handler
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
        bio: bioValue.trim(),
        headline: headline.trim(),
        location: location.trim(),
        website: website.trim(),
        avatarUrl,
        coverUrl,
        skills,
        socialLinks,
      });

      if (res.data?.success && res.data?.data) {
        onSuccess(res.data.data);
        setOpen(false);
      } else {
        setError("Failed to update profile.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-xl [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. Upload cover and avatar, change username, location, biography, website, skills, and social links.
        </DialogDescription>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {/* Cover & Avatar Header */}
          <div className="relative h-36 bg-gradient-to-br from-indigo-900 to-slate-900 overflow-hidden flex-shrink-0">
            {coverUrl && (
              <img
                src={coverUrl}
                alt="Profile Background"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40">
              <button
                type="button"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                title="Change Cover Image"
              >
                {uploadingCover ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ImagePlus size={16} />
                )}
              </button>
              {coverUrl && (
                <button
                  type="button"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80"
                  onClick={() => setCoverUrl("")}
                  title="Remove Cover Image"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Avatar Area */}
          <div className="-mt-10 px-6 mb-4 flex-shrink-0">
            <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-md">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  className="h-full w-full object-cover"
                  alt="Profile Avatar"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white">
                  {usernameState.slice(0, 2).toUpperCase() || "?"}
                </div>
              )}
              <button
                type="button"
                className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change Avatar"
              >
                {uploadingAvatar ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-xs">
                {error}
              </div>
            )}

            {/* Username & Headline */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-username`}>Username</Label>
                <Input
                  id={`${id}-username`}
                  placeholder="Username"
                  value={usernameState}
                  onChange={(e) => setUsernameState(e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-headline`}>Headline</Label>
                <Input
                  id={`${id}-headline`}
                  placeholder="e.g. Senior Frontend Developer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  type="text"
                />
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-bio`}>Biography</Label>
              <Textarea
                id={`${id}-bio`}
                placeholder="Write a few sentences about yourself..."
                value={bioValue}
                maxLength={maxLength}
                onChange={handleBioChange}
              />
              <p className="text-right text-xs text-muted-foreground">
                <span className="tabular-nums">{maxLength - characterCount}</span> characters left
              </p>
            </div>

            {/* Location & Website */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-location`}>Location</Label>
                <div className="flex gap-2">
                  <Input
                    id={`${id}-location`}
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="text"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleFetchLocation}
                    disabled={fetchingLocation}
                    title="Get location from GPS"
                    className="p-2 border border-input bg-background hover:bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    {fetchingLocation ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MapPin size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-website`}>Website</Label>
                <Input
                  id={`${id}-website`}
                  placeholder="e.g. portfolio.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  type="text"
                />
              </div>
            </div>

            {/* Skills & Technologies */}
            <div className="space-y-2">
              <Label>Skills & Technologies</Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 border border-border rounded-lg min-h-[40px] items-center">
                {skills.length === 0 ? (
                  <span className="text-xs text-muted-foreground/70 italic px-1">No skills added.</span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-2 py-0.5 rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-500 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill (e.g. React, Docker)"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => handleAddSkill()}>
                  Add
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-sm font-semibold">Social Links</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Instagram", placeholder: "https://instagram.com/handle", value: instagram, onChange: setInstagram },
                  { label: "Twitter / X", placeholder: "https://x.com/handle", value: twitterLink, onChange: setTwitterLink },
                  { label: "Threads", placeholder: "https://threads.net/@handle", value: threads, onChange: setThreads },
                  { label: "GitHub", placeholder: "https://github.com/handle", value: githubLink, onChange: setGithubLink },
                  { label: "LinkedIn", placeholder: "https://linkedin.com/in/handle", value: linkedinLink, onChange: setLinkedinLink },
                ].map((social) => (
                  <div key={social.label} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{social.label}</Label>
                    <Input
                      placeholder={social.placeholder}
                      value={social.value}
                      onChange={(e) => social.onChange(e.target.value)}
                      type="url"
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <DialogFooter className="border-t border-border px-6 py-4 flex-shrink-0 bg-background/90 sticky bottom-0 z-10">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
