// app/auth/register/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient as supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function RegisterPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "user" }, // default role assignment
      },
    });

    if (error || !data.user) {
      setError(error?.message || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    setLoading(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark overflow-hidden transition-colors">
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-blue opacity-20 sm:opacity-30 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-brand-muted dark:border-neon-purple bg-overlay-light dark:bg-overlay-dark backdrop-blur-xl px-4 sm:px-8 py-8 shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col items-center mb-4">
          <img
            src="/logo.png"
            alt="Pixel Pro Logo"
            className="w-16 h-16 mb-2"
          />
          <h1 className="text-3xl font-heading font-bold text-center bg-gradient-to-r from-brand-accent via-brand-primary to-brand-yellow text-transparent bg-clip-text">
            Create Account
          </h1>
        </div>

        <p className="text-sm text-center text-brand-muted dark:text-brand-blue mb-6">
          Get started with your Pixel Pro Portal account
        </p>

        {error && (
          <div className="mb-4 bg-red-500 text-white text-sm text-center rounded px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white dark:bg-zinc-800 border border-brand-muted dark:border-zinc-700 text-black dark:text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white dark:bg-zinc-800 border border-brand-muted dark:border-zinc-700 text-black dark:text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white dark:bg-zinc-800 border border-brand-muted dark:border-zinc-700 text-black dark:text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-brand-yellow text-black font-semibold shadow-md hover:shadow-neon transition-all"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-brand-muted dark:text-brand-blue mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-primary dark:text-brand-accent hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
