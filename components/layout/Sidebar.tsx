"use client";

import {
  Home,
  FolderKanban,
  FileText,
  FileEdit,
  Users2,
  MessageCircle,
  Bot,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { supabaseClient as supabase } from "@/utils/supabaseClient";

// Component
export default function Sidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [badgeCounts, setBadgeCounts] = useState({
    messages: 0,
    invoices: 0,
    crowd: 0,
  });

  // Fetch user role from Supabase
  useEffect(() => {
    const getRole = async () => {
      const { data } = await supabase.auth.getUser();
      setRole(data?.user?.user_metadata?.role || null);
    };
    getRole();
  }, []);

  // Subscribe to badge counts from Supabase tables (simplified demo)
  useEffect(() => {
    const fetchCounts = async () => {
      const user = (await supabase.auth.getUser()).data?.user;

      const [msgRes, invRes, crowdRes] = await Promise.all([
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("crowd_participation").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
      ]);

      setBadgeCounts({
        messages: msgRes.count || 0,
        invoices: invRes.count || 0,
        crowd: crowdRes.count || 0,
      });
    };

    fetchCounts();

    const msgSub = supabase
      .channel("messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchCounts)
      .subscribe();

    const invSub = supabase
      .channel("invoices")
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, fetchCounts)
      .subscribe();

    const crowdSub = supabase
      .channel("crowd_participation")
      .on("postgres_changes", { event: "*", schema: "public", table: "crowd_participation" }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(msgSub);
      supabase.removeChannel(invSub);
      supabase.removeChannel(crowdSub);
    };
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/invoices", label: "Invoices", icon: FileText, badgeKey: "invoices" },
    { href: "/estimates", label: "Estimates", icon: FileEdit },
    { href: "/crowd", label: "Crowd Projects", icon: Users2, badgeKey: "crowd" },
    { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" },
    { href: "/enzo", label: "Enzo", icon: Bot },
  ];

  const adminItems = [{ href: "/admin", label: "Admin Panel", icon: Settings }];

  const itemsToRender = [...navItems, ...(role === "admin" ? adminItems : [])];

  return (
    <aside className="fixed top-0 left-0 h-screen w-16 lg:w-64 bg-brand-light dark:bg-brand-dark border-r border-zinc-300 dark:border-zinc-800 z-40 flex flex-col py-4 transition-all duration-300">
      <div className="flex items-center justify-center lg:justify-start gap-2 px-4 mb-8">
        <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
        <span className="hidden lg:inline-block text-xl font-heading font-bold text-brand-dark dark:text-white">
          Pixel Pro
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {itemsToRender.map(({ href, label, icon: Icon, badgeKey }) => {
          const isActive = pathname === href;
          const isHovered = hovered === href;
          const showBadge = badgeKey && badgeCounts[badgeKey] > 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                if (hovered !== href) {
                  e.preventDefault();
                  setHovered(href);
                }
              }}
              className={clsx(
                "group flex items-center gap-3 px-4 py-2 rounded-lg mx-2 transition-all relative",
                isActive
                  ? "bg-brand-primary text-white"
                  : isHovered
                  ? "bg-brand-light dark:bg-brand-dark text-brand-yellow"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-brand-light hover:dark:bg-brand-dark hover:text-brand-yellow"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden lg:inline-block text-sm font-medium">{label}</span>

              {/* Badge */}
              {showBadge && (
                <span
                  className={clsx(
                    "absolute right-3 top-2 lg:right-4 inline-block px-2 py-0.5 text-xs font-bold rounded-full",
                    "dark:text-white dark:bg-brand-orange",
                    "text-red-600 bg-black"
                  )}
                >
                  {badgeCounts[badgeKey]}
                </span>
              )}

              {/* Tooltip for mobile */}
              {!isActive && hovered === href && (
                <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white px-2 py-1 text-xs rounded shadow-md lg:hidden">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
