// components/projects/UserProjectsTable.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database } from "@/types";
import ProgressTracker from "./ProgressTracker";

type ProjectMemberWithProject = Database["public"]["Tables"]["project_members"]["Row"] & {
  projects: Database["public"]["Tables"]["projects"]["Row"];
};

export default function UserProjectsTable({ userId }: { userId: string }) {
  const supabase = useSupabaseClient<Database>();
  const [projectLinks, setProjectLinks] = useState<ProjectMemberWithProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("project_members")
      .select("*, projects(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to fetch user projects:", error);
    } else if (data) {
      setProjectLinks(data);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-6">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-900 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
          {projectLinks.map((link) => {
            const project = link.projects;
            return (
              <tr
                key={project.id}
                className={`cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  selectedProjectId === project.id ? "bg-zinc-50 dark:bg-zinc-800/50" : ""
                }`}
                onClick={() =>
                  setSelectedProjectId((prev) => (prev === project.id ? null : project.id))
                }
              >
                <td className="px-4 py-2 text-sm font-medium">{project.title}</td>
                <td className="px-4 py-2 text-sm">{project.description}</td>
                <td className="px-4 py-2 text-sm capitalize">{project.status}</td>
                <td className="px-4 py-2 text-sm">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedProjectId && (
        <div className="mt-4">
          <ProgressTracker projectId={selectedProjectId} isAdmin={false} />
        </div>
      )}
    </div>
  );
}
