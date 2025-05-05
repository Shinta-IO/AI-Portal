"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { Loader2 } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectWithStats extends Project {
  member_count: number;
  task_count: number;
  completed_tasks: number;
}

export default function ProjectCards() {
  const { supabase } = useSupabase();
  const [projects, setProjects] = useState<ProjectWithStats[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.rpc("get_project_stats");

      if (error) {
        console.error("❌ Failed to fetch project stats:", error);
        setProjects([]);
      } else {
        setProjects(data as ProjectWithStats[]);
      }

      setLoading(false);
    };

    fetchProjects();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin w-6 h-6 text-zinc-500" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <p className="text-center text-zinc-500 dark:text-zinc-400">
        No projects found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const completionRate =
          project.task_count > 0
            ? Math.round((project.completed_tasks / project.task_count) * 100)
            : 0;

        return (
          <div
            key={project.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
            <p className="text-sm text-zinc-500 mb-2">{project.description}</p>
            <div className="text-sm">
              <p>👥 Members: {project.member_count}</p>
              <p>✅ Tasks: {project.completed_tasks}/{project.task_count}</p>
              <p>📈 Progress: {completionRate}%</p>
            </div>
            <div className="mt-2 w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
