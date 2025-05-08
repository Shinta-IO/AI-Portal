// components/dashboard/ProjectTrackerCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProgressTracker from "@/components/projects/ProgressTracker";


interface Project {
  id: string;
  title: string;
  status: string;
}

interface ProjectTrackerCardProps {
  projects: Project[];
  activeProjectId: string | null;
  onSwitchProject: (id: string) => void;
}

export default function ProjectTrackerCard({ projects, activeProjectId, onSwitchProject }: ProjectTrackerCardProps) {
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Active Project</h2>

          {activeProjects.length > 1 && (
            <Select
              onValueChange={(value) => onSwitchProject(value)}
              defaultValue={activeProjectId || activeProjects[0].id}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {activeProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {activeProjectId ? (
          <ProgressTracker projectId={activeProjectId} />
        ) : (
          <p className="text-sm text-muted-foreground">No active project selected.</p>
        )}
      </CardContent>
    </Card>
  );
}
