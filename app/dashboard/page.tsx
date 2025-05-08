// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import ProjectTrackerCard from "@/components/dashboard/ProjectTrackerCard";

export default function ClientDashboardPage() {
  const { supabase, session } = useSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*, projects (*)")
        .eq("id", userId)
        .single();

      if (error || !profileData) {
        console.error("❌ Profile fetch error or not found:", error?.message);
        return;
      }

      setProfile(profileData);
      setProjects(profileData.projects || []);
      setActiveProjectId(profileData.projects?.[0]?.id || null);
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        if (payload.new.receiver_id === userId) {
          setUnreadCount((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!session?.user) return <div className="p-4 text-red-500">Not authenticated.</div>;

  if (!profile) return <div className="p-4 text-muted-foreground">Loading your dashboard...</div>;

  return (
    <div className="grid gap-4 p-4">
      <UserProfileCard
        profile={profile}
        unreadCount={unreadCount}
        projectStats={{
          active: projects.filter((p) => p.status === "active").length,
          completed: projects.filter((p) => p.status === "completed").length,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAccessCard type="estimates" userId={userId} />
        <QuickAccessCard type="invoices" userId={userId} />
        <QuickAccessCard type="crowd" userId={userId} />
      </div>

      <ProjectTrackerCard
        projects={projects}
        activeProjectId={activeProjectId}
        onSwitchProject={setActiveProjectId}
      />
    </div>
  );
}
