"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import ProgressTracker from "./ProgressTracker";
import TaskViewer from "./TaskViewer"; // ✅ new import

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];

type ProjectMemberWithProject = ProjectMember & {
  projects: Project | null;
};

export default function UserProjectsTable({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [projectLinks, setProjectLinks] = useState<ProjectMemberWithProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("project_members")
      .select("*, projects(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching user projects:", error);
    } else {
      console.log("✅ Project membership data:", data);
      setProjectLinks(data ?? []);
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
          {projectLinks.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-400">
                No projects found.
              </td>
            </tr>
          ) : (
            projectLinks.map((link) => {
              const project = link.projects;
              if (!project) {
                console.warn("⚠️ NULL join: project_members row missing project:", link);
                return (
                  <tr key={link.id} className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    <td className="px-4 py-2 text-sm font-medium" colSpan={4}>
                      ⚠️ Invalid project reference. Contact admin.
                    </td>
                  </tr>
                );
              }

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
            })
          )}
        </tbody>
      </table>

      {selectedProjectId && (
        <>
          <div className="mt-4">
            <ProgressTracker projectId={selectedProjectId} isAdmin={false} />
          </div>
          <div className="mt-4">
            <TaskViewer projectId={selectedProjectId} userId={userId} /> {/* ✅ New addition */}
          </div>
        </>
      )}
    </div>
  );
}
