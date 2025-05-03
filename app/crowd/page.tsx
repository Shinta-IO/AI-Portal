"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import type { Database } from "@/types";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CrowdProjectsPage() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      const [{ data: projectsData }, { data: joined }] = await Promise.all([
        supabase.from("crowd_projects").select("*").eq("status", "open").order("created_at", { ascending: false }),
        supabase.from("crowd_participation").select("crowd_project_id").eq("user_id", user.id),
      ]);

      setProjects(projectsData || []);
      setJoinedIds(new Set((joined || []).map((p) => p.crowd_project_id)));
      setLoading(false);
    };

    loadData();
  }, [user?.id, supabase]);

  const handleJoin = async (projectId: string) => {
    if (!user?.id || joinedIds.has(projectId)) return;

    await supabase
      .from("crowd_participation")
      .insert({ user_id: user.id, crowd_project_id: projectId, amount: 0, paid: false });

    setJoinedIds((prev) => new Set(prev).add(projectId));
  };

  if (!user || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="relative min-h-screen px-4 sm:px-8 py-12 bg-brand-light dark:bg-brand-dark transition-colors">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-blue opacity-10 sm:opacity-20 blur-3xl z-0"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-brand-accent via-brand-primary to-brand-yellow text-transparent bg-clip-text">
              Crowd Projects
            </h1>
            <p className="text-brand-muted dark:text-brand-blue mt-2">
              Join forces with others to co-fund innovative builds.
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const joined = joinedIds.has(project.id);
              const progress = Math.min(100, (project.current_amount / project.goal_amount) * 100);

              return (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.03 }}
                  className="rounded-xl border border-brand-muted dark:border-brand-blue bg-white dark:bg-zinc-900 p-6 shadow-md transition"
                >
                  <h2 className="text-xl font-bold text-brand-primary dark:text-brand-accent mb-1">
                    {project.title}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                    {project.description}
                  </p>

                  <div className="mb-4">
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="h-2 bg-brand-yellow" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs mt-1 text-zinc-500">
                      ${project.current_amount} of ${project.goal_amount} funded
                    </p>
                  </div>

                  <button
                    onClick={() => handleJoin(project.id)}
                    disabled={joined}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-all ${
                      joined
                        ? "bg-zinc-400 text-white cursor-not-allowed"
                        : "bg-brand-yellow text-black hover:bg-brand-orange"
                    }`}
                  >
                    {joined ? "Joined" : "Join Project"}
                  </button>
                </motion.div>
              );
            })}
          </section>

          <div className="flex items-center justify-between p-6 border border-brand-muted dark:border-brand-blue rounded-2xl bg-overlay-light dark:bg-overlay-dark backdrop-blur-md shadow">
            <div>
              <h3 className="text-xl font-heading font-bold text-brand-primary dark:text-brand-accent">
                Have an idea worth sharing?
              </h3>
              <p className="text-sm text-brand-muted dark:text-brand-blue">
                Admins can start new Crowd Commissions directly from the Estimate panel.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black font-medium rounded-md shadow hover:shadow-neon transition">
              <Sparkles className="w-4 h-4" />
              Submit Idea
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
