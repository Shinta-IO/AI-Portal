"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { navTabs, adminTabs } from "@/constants/navConfig";
import SidebarItem, { SidebarAvatar } from "@/components/sidebar/SidebarItem";
import { useBadgeNotifications } from "@/hooks/useBadgeNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();

  const [role, setRole] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const badgeCounts = useBadgeNotifications();
  const user = session?.user;

  const [profile, setProfile] = useState<{ first_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (session?.user?.user_metadata?.role) {
      setRole(session.user.user_metadata.role);
    }
  }, [session]);

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) setProfile(data);
    };

    loadProfile();
  }, [user?.id, supabase]);

  const handleClick = async (href: string) => {
    if (!user) return;

    await supabase.from("last_visited").upsert({
      user_id: user.id,
      tab: href,
      visited_at: new Date().toISOString(),
    });

    router.push(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 lg:w-64 z-40 flex flex-col py-4 transition-all duration-300 shadow-sm border-r border-border bg-slate-600 dark:bg-background/60 backdrop-blur-md">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none dark:mix-blend-lighten bg-cover bg-center"
        style={{ backgroundImage: 'url("/sidebar.png")' }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center justify-center lg:justify-start gap-2 px-4 mb-6">
        <Image src="/logo.png" alt="Logo" width={64} height={64} priority />
        <span className="hidden lg:inline-block text-xl font-heading font-bold text-foreground">
          Pixel Pro
        </span>
      </div>

      {/* Nav Items */}
      <ScrollArea className="relative z-10 flex-1 px-2">
        {[...navTabs, ...(role === "admin" ? adminTabs : [])].map(({ href, label, icon }) => (
          <SidebarItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            hovered={hovered}
            setHovered={setHovered}
            badgeCount={badgeCounts[href] || 0}
            active={pathname === href}
            onClick={() => handleClick(href)}
          />
        ))}
      </ScrollArea>

      {/* Settings and Avatar */}
      <Separator className="relative z-10 my-2 mx-4" />

      <div className="relative z-10 px-2">
        <SidebarItem
          href="/settings"
          label="Settings"
          icon={SettingsIcon}
          hovered={hovered}
          setHovered={setHovered}
          active={pathname === "/settings"}
          onClick={() => handleClick("/settings")}
        />
      </div>

      {user && (
        <div className="relative z-10">
          <SidebarAvatar
            name={profile?.first_name || user.email || "User"}
            avatarUrl={profile?.avatar_url}
          />
        </div>
      )}
    </aside>
  );
}
