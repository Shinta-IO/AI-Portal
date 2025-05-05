"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export default function SettingsPage() {
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  const handleUpdate = async () => {
    if (!profile) return;

    let avatar_url = profile.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${profile.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (!uploadError) {
        avatar_url = supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;
      }
    }

    await supabase
      .from("profiles")
      .update({ ...profile, avatar_url })
      .eq("id", profile.id);

    alert("Profile updated");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <label className="block">
        First Name
        <input
          type="text"
          value={profile.first_name || ""}
          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
          className="w-full px-3 py-2 border rounded mt-1"
        />
      </label>

      <label className="block">
        Last Name
        <input
          type="text"
          value={profile.last_name || ""}
          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
          className="w-full px-3 py-2 border rounded mt-1"
        />
      </label>

      <label className="block">
        Email
        <input
          type="email"
          value={profile.email || ""}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          className="w-full px-3 py-2 border rounded mt-1"
        />
      </label>

      <label className="block">
        Avatar
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          className="mt-2"
        />
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-20 h-20 rounded-full mt-3 border"
          />
        )}
      </label>

      <button
        onClick={handleUpdate}
        className="bg-brand text-white px-6 py-2 rounded hover:bg-brand-dark"
      >
        Save Changes
      </button>
    </div>
  );
}
