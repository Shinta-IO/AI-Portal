"use client";

import { useState } from "react";
import CrowdBackground from "@/components/crowd/CrowdBackground";
import CrowdClientSection from "@/components/crowd/CrowdClientSection";
import CrowdProjectAdminForm from "@/components/crowd/CrowdProjectAdminForm";
import { Button } from "@/components/ui/button";
import type { CrowdProject } from "@/types/crowd";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

type Props = {
  projects: CrowdProject[];
  joinedIds: Set<string>;
  userId: string;
};

export default function CrowdClientWrapper({ projects, joinedIds, userId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<CrowdProject | null>(null);
  const { supabase } = useSupabase();

  const isAdmin = Boolean(
    userId && process.env.NEXT_PUBLIC_ADMIN_ID?.split(",").includes(userId)
  );
  

  const handleEdit = (project: CrowdProject) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setEditingProject(null);
    setShowForm(false);
    // Optionally trigger revalidation or refresh project list
  };

  return (
    <>
      <CrowdBackground />

      {isAdmin && (
        <div className="px-6 mt-6">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>+ Create Project</Button>
          ) : (
            <CrowdProjectAdminForm
              editingProject={editingProject || undefined}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      )}

      <CrowdClientSection
        projects={projects}
        joinedIds={joinedIds}
        userId={userId}
        onEdit={isAdmin ? handleEdit : undefined}
      />
    </>
  );
}
