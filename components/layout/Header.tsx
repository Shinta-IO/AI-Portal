"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { SunMedium, Moon, LogOut } from "lucide-react";

export default function Header() {
  const { session, supabase } = useSupabase();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const user = session?.user;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Prevents hydration mismatch
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const name = user?.user_metadata?.name || user?.email || "Guest";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="fixed top-0 left-16 lg:left-64 right-0 h-16 z-30 px-4 flex items-center justify-between shadow-sm border-b border-border bg-stone-800/40 dark:bg-black/85 backdrop-blur-md">
      {/* Custom pixel overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 mix-blend-darken dark:mix-blend-lighten dark:opacity-20 bg-center"
        style={{
          backgroundImage: 'url("/navbar.png")',
        }}
      />

      {/* Title */}
      <div className="relative z-10 text-lg font-heading font-bold text-foreground tracking-tight">
        Client Portal
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <SunMedium className="w-5 h-5 text-brand-yellow" />
            ) : (
              <Moon className="w-5 h-5 text-black" />
            )}
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-full"
        >
          <LogOut className="w-5 h-5 text-black dark:text-blue-300" />
        </Button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 ring-2 ring-brand-accent ring-offset-background">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline text-sm font-medium text-foreground truncate max-w-[140px]">
            {name}
          </span>
        </div>
      </div>
    </header>
  );
}
