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
    <header className="fixed top-0 left-16 lg:left-64 right-0 h-16 z-30 px-6 flex items-center justify-between bg-gradient-to-r from-brand-dark/95 to-slate-900/95 dark:from-black/90 dark:to-brand-dark/90 backdrop-blur-md border-b border-brand-accent/10 dark:border-brand-primary/20 shadow-[0_2px_15px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
      {/* Glow effects */}
      <div className="absolute bottom-0 left-1/4 w-1/3 h-1 bg-gradient-to-r from-brand-accent/30 via-brand-primary/30 to-brand-secondary/30 blur-sm"></div>
      
      {/* Custom pixel overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay dark:mix-blend-soft-light dark:opacity-15 bg-center"
        style={{
          backgroundImage: 'url("/navbar.png")',
        }}
      />

      {/* Title */}
      <div className="relative z-10 text-lg font-heading font-bold tracking-tight text-white dark:text-white/95 drop-shadow-sm">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-white to-brand-secondary dark:from-brand-pink dark:to-brand-blue">
          Client Portal
        </span>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 transition-all duration-200 border border-transparent hover:border-brand-accent/20 dark:hover:border-brand-primary/30"
          >
            {theme === "dark" ? (
              <SunMedium className="w-5 h-5 text-brand-yellow drop-shadow-[0_0_3px_rgba(255,209,102,0.5)]" />
            ) : (
              <Moon className="w-5 h-5 text-brand-blue/90" />
            )}
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-full hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 transition-all duration-200 border border-transparent hover:border-brand-accent/20 dark:hover:border-brand-primary/30"
        >
          <LogOut className="w-5 h-5 text-brand-accent/90 dark:text-brand-secondary" />
        </Button>

        {/* Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-brand-primary/20">
          <Avatar className="w-8 h-8 ring-2 ring-brand-accent ring-offset-1 ring-offset-slate-900 shadow-[0_0_10px_rgba(255,110,199,0.2)]">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-accent text-white">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline text-sm font-medium text-white/90 dark:text-white/90 truncate max-w-[140px]">
            {name}
          </span>
        </div>
      </div>
    </header>
  );
}
