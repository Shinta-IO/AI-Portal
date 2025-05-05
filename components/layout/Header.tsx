"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { supabase, session } = useSupabase();
  const [name, setName] = useState("Guest");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract user's display name
  useEffect(() => {
    if (!session?.user) return;
    const { user_metadata, email } = session.user;
    const displayName = user_metadata?.name || email?.split("@")[0] || "User";
    setName(displayName);
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (!mounted) return null;

  return (
    <header className="relative z-20 w-full bg-brand-light dark:bg-brand-dark text-black dark:text-white shadow-md flex items-center justify-between px-4 sm:px-6 py-3 border-b border-brand-muted dark:border-zinc-800">
      {/* Animated Icon */}
      <motion.div
        className="hidden sm:block w-6 h-6 mr-2 rounded-full bg-gradient-to-tr from-brand-accent via-brand-yellow to-brand-blue shadow-neon"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />

      {/* Page Title */}
      <h1 className="text-xl font-heading font-semibold">Dashboard</h1>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-80">{name}</span>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-brand-muted/30 dark:bg-zinc-700 hover:bg-brand-yellow/20 dark:hover:bg-brand-yellow/10 transition"
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-red-500/90 hover:bg-red-500 text-white transition"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
