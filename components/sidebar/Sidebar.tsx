"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
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

  const isDark = theme === "dark";

  // Define the classes based on theme
  const getActiveClass = isDark 
    ? "bg-gradient-to-r from-brand-primary to-neon-purple text-white border border-brand-primary/40 shadow-[0_2px_10px_rgba(140,82,255,0.25)]"
    : "bg-gradient-to-r from-brand-secondary to-brand-blue text-brand-dark border border-brand-secondary/30 shadow-sm";
    
  const getHoverClass = isDark
    ? "hover:bg-brand-dark/80 hover:text-brand-pink border-brand-primary/20"
    : "hover:bg-white/40 hover:text-brand-primary border-brand-secondary/20";

  return (
    <aside className={`fixed top-0 left-0 h-screen w-16 lg:w-64 z-40 flex flex-col py-4 transition-all duration-300 border-r shadow-[4px_0_20px_rgba(0,0,0,0.2)] ${
      isDark 
        ? "bg-gradient-to-b from-brand-dark to-black/95 border-brand-primary/20" 
        : "bg-gradient-to-b from-brand-light to-white/90 border-brand-secondary/20"
    }`}>
      {/* Subtle glow effects */}
      {isDark ? (
        <>
          <div className="absolute top-20 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>
          <div className="absolute bottom-20 right-0 w-40 h-40 bg-brand-accent/10 rounded-full blur-[80px] z-0 pointer-events-none"></div>
          <div className="absolute -bottom-5 left-1/4 w-3/4 h-1 bg-gradient-to-r from-brand-accent/0 via-brand-primary/30 to-brand-secondary/0 blur-sm"></div>
        </>
      ) : (
        <div className="absolute top-1/4 left-0 w-full h-1/2 bg-gradient-to-r from-brand-secondary/5 via-brand-primary/5 to-brand-accent/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      )}

      {/* Background Image Overlay with increased visibility */}
      <div
        className={`absolute inset-0 pointer-events-none bg-cover bg-center z-5 ${
          isDark 
            ? "opacity-20 dark:opacity-80 mix-blend-screen" 
            : "opacity-75 mix-blend-darken"
        }`}
        style={{ backgroundImage: 'url("/sidebar.png")' }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center justify-center lg:justify-start gap-3 px-6 mb-8">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full p-0.5 shadow-lg ${
          isDark 
            ? "bg-gradient-to-br from-brand-primary to-neon-purple shadow-[0_0_15px_rgba(140,82,255,0.25)]" 
            : "bg-gradient-to-br from-brand-secondary to-brand-blue"
        }`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-black/10 flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={48} 
              height={48} 
              priority 
              className="transform scale-90"
            />
          </div>
        </div>
        <span className={`hidden lg:inline-block text-xl font-heading font-bold tracking-wide ${
          isDark 
            ? "text-white drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-pink to-white" 
            : "text-brand-dark"
        }`}>
          Pixel Pro
        </span>
      </div>

      {/* Nav Items */}
      <ScrollArea className="relative z-10 flex-1 px-3 py-2">
        <div className="space-y-1.5">
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
              isDark={isDark}
              activeClass={getActiveClass}
              hoverClass={getHoverClass}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Settings and Avatar */}
      <Separator className={`relative z-10 my-3 mx-3 ${isDark ? "opacity-20" : "opacity-30"}`} />

      <div className="relative z-10 px-3 mb-2">
        <SidebarItem
          href="/settings"
          label="Settings"
          icon={SettingsIcon}
          hovered={hovered}
          setHovered={setHovered}
          active={pathname === "/settings"}
          onClick={() => handleClick("/settings")}
          isDark={isDark}
          activeClass={getActiveClass}
          hoverClass={getHoverClass}
        />
      </div>

      {user && (
        <div className="relative z-10">
          <SidebarAvatar
            name={profile?.first_name || user.email || "User"}
            avatarUrl={profile?.avatar_url}
            isDark={isDark}
          />
        </div>
      )}
    </aside>
  );
}
