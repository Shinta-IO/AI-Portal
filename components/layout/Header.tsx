"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { supabaseClient as supabase } from "@/utils/supabaseClient";
import { motion } from "framer-motion";

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [name, setName] = useState("Guest");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the user’s display name
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.user_metadata?.name) {
        setName(data.user.user_metadata.name);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (!mounted) return null; // Fix hydration mismatch by blocking render until mounted

  return (
    <header className="relative z-20 w-full bg-brand-light dark:bg-brand-dark text-black dark:text-white shadow-md flex items-center justify-between px-4 sm:px-6 py-3 border-b border-brand-muted dark:border-zinc-800">
      {/* Animated Tech Icon */}
      <motion.div
        className="hidden sm:block w-6 h-6 mr-2 rounded-full bg-gradient-to-tr from-brand-accent via-brand-yellow to-brand-blue shadow-neon"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />

      {/* Page Title */}
      <h1 className="text-xl font-heading font-semibold">Dashboard</h1>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-80">{name}</span>

        <button
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
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
