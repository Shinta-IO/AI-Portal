"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient as supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/shared/icons";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setError(error?.message || "Login failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    setLoading(false);
  }

  async function handleOAuth() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden transition-colors">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-blue opacity-20 sm:opacity-30 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card backdrop-blur-xl px-4 sm:px-8 py-8 shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="Pixel Pro Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-heading font-bold text-center text-foreground">
            Pixel Pro Portal
          </h1>
        </div>

        <p className="text-sm text-center text-muted-foreground mb-6">
          Sign in to access your projects and team dashboard
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleOAuth}
          >
            <Icons.google className="w-4 h-4" /> Sign in with Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Don’t have an account?{' '}
          <Link href="/auth/register" className="text-brand-primary hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
