"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { AnimatePresence, motion } from "framer-motion";
import CrowdProjectCard from "./CrowdProjectCard";
import CrowdProjectDashboard from "./CrowdProjectDashboard";
import CrowdProjectDetailsModal from "./CrowdProjectDetailsModal";
import type { CrowdProject } from "./CrowdProject";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  projects: CrowdProject[];
  joinedIds: Set<string>;
  userId: string;
  onEdit?: (project: CrowdProject) => void;
}

export default function CrowdClientSection({ projects, joinedIds, userId, onEdit }: Props) {
  const { supabase, session } = useSupabase();

  const [selectedProject, setSelectedProject] = useState<CrowdProject | null>(null);
  const [detailModalProject, setDetailModalProject] = useState<CrowdProject | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [localJoinedIds, setLocalJoinedIds] = useState<Set<string>>(joinedIds);
  const [channelUserIds, setChannelUserIds] = useState<string[]>([]);

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRole(session?.user?.user_metadata?.role || null);
  }, [session]);

  useEffect(() => {
    if (selectedProject?.channel_id) {
      supabase
        .from("channel_members")
        .select("user_id")
        .eq("channel_id", selectedProject.channel_id)
        .then(({ data, error }) => {
          if (!error && data) {
            setChannelUserIds(data.map((row) => row.user_id));
          }
        });
    }
  }, [selectedProject, supabase]);

  const isAdmin = role === "admin";

  const handleView = (project: CrowdProject) => {
    setDetailModalProject(project);
  };

  const handleJoin = async (project: CrowdProject) => {
    const expected = project.expected_participants ?? 1;
    const amount = Math.round(project.goal_amount / expected);

    const { error } = await supabase.from("crowd_participation").insert({
      user_id: userId,
      crowd_project_id: project.id,
      amount,
      status: "pending",
    });

    if (error) {
      console.error("Join failed:", error.message);
    } else {
      const updated = new Set(localJoinedIds);
      updated.add(project.id);
      setLocalJoinedIds(updated);
    }
  };

  return (
    <main className="relative min-h-screen px-4 sm:px-8 py-12 bg-transparent transition-colors">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {projects.map((project) => (
          <CrowdProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            goal={project.goal_amount / 100}
            current={(project.current_amount || 0) / 100}
            joined={localJoinedIds.has(project.id)}
            onView={() => handleView(project)}
            onJoin={() => {
              setSelectedProject(project);
              sectionRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onEdit={isAdmin && onEdit ? () => onEdit(project) : undefined}
          />
        ))}
      </section>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            key="dashboard"
            ref={sectionRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border border-brand-muted dark:border-zinc-800 shadow-xl rounded-2xl p-6 mb-12">
              <CardContent>
                <CrowdProjectDashboard
                  project={selectedProject}
                  onClose={() => setSelectedProject(null)}
                  userId={userId}
                  channelUserIds={channelUserIds}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {detailModalProject && (
        <CrowdProjectDetailsModal
          isOpen={!!detailModalProject}
          onClose={() => setDetailModalProject(null)}
          project={detailModalProject}
          userId={userId}
          channelUserIds={channelUserIds}
          onJoin={() => {
            setSelectedProject(detailModalProject);
            setDetailModalProject(null);
            sectionRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}
    </main>
  );
}
