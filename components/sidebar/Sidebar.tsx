"use client";

import {
  Home,
  FolderKanban,
  FileText,
  FileEdit,
  Users2,
  MessageCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import SidebarItem from "@/components/sidebar/SidebarItem";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();

  const [role, setRole] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const user = session?.user;

  const tabs = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Projects", icon: FolderKanban, table: "project_members" },
    { href: "/invoices", label: "Invoices", icon: FileText, table: "invoices" },
    { href: "/estimates", label: "Estimates", icon: FileEdit, table: "estimates" },
    { href: "/crowd", label: "Crowd Projects", icon: Users2, table: "crowd_participation" },
    { href: "/messages", label: "Messages", icon: MessageCircle, table: "messages" },
  ];

  const adminTabs = role === "admin" ? [
    { href: "/admin", label: "Admin Panel", icon: SettingsIcon }
  ] : [];

  useEffect(() => {
    if (session?.user?.user_metadata?.role) {
      setRole(session.user.user_metadata.role);
    }
  }, [session]);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const updates: Record<string, number> = {};
      for (const tab of tabs) {
        if (!tab.table) continue;

        const { data: visit } = await supabase
          .from("last_visited")
          .select("visited_at")
          .eq("user_id", user.id)
          .eq("tab", tab.href)
          .maybeSingle();

        const { count } = await supabase
          .from(tab.table)
          .select("*", { count: "exact", head: true })
          .gte("created_at", visit?.visited_at || "1970-01-01T00:00:00Z")
          .eq(
            ["invoices", "estimates", "project_members"].includes(tab.table) ? "user_id" : undefined,
            user.id
          );

        updates[tab.href] = count || 0;
      }
      setBadgeCounts(updates);
    };

    fetchCounts();

    const subs = tabs
      .filter(t => t.table)
      .map(t =>
        supabase
          .channel(t.table!)
          .on("postgres_changes", { event: "*", schema: "public", table: t.table! }, fetchCounts)
          .subscribe()
      );

    return () => {
      subs.forEach(sub => supabase.removeChannel(sub));
    };
  }, [supabase, user?.id]);

  const handleClick = async (href: string) => {
    if (!user) return;

    await supabase.from("last_visited").upsert({
      user_id: user.id,
      tab: href,
      visited_at: new Date().toISOString(),
    });

    setBadgeCounts(prev => ({ ...prev, [href]: 0 }));
    router.push(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 lg:w-64 bg-brand-light dark:bg-brand-dark border-r border-zinc-300 dark:border-zinc-800 z-40 flex flex-col py-4 transition-all duration-300">
      <div className="flex items-center justify-center lg:justify-start gap-2 px-4 mb-8">
        <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
        <span className="hidden lg:inline-block text-xl font-heading font-bold text-brand-dark dark:text-white">
          Pixel Pro
        </span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {[...tabs, ...adminTabs].map(({ href, label, icon }) => (
          <SidebarItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            hovered={hovered}
            setHovered={setHovered}
            badgeCount={badgeCounts[href]}
            active={pathname === href}
            onClick={() => handleClick(href)}
          />
        ))}
      </nav>

      <div className="mt-auto px-2">
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
    </aside>
  );
}
