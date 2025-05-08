// components/crowd/CrowdProjectDashboard.tsx
"use client";

import { useState } from "react";
import { X, Users } from "lucide-react";
import type { CrowdProject } from "@/types/crowd";
import GroupPaymentModal from "@/components/crowd/GroupPaymentModal";

interface Props {
  project: CrowdProject;
  userId: string;
  channelUserIds: string[];
  onClose: () => void;
}

export default function CrowdProjectDashboard({ project, userId, channelUserIds, onClose }: Props) {
  const [groupOpen, setGroupOpen] = useState(false);

  const currentAmount = typeof project.current_amount === "number" ? project.current_amount : 0;
  const goalAmount = typeof project.goal_amount === "number" && project.goal_amount > 0 ? project.goal_amount : 1;
  const progress = Math.min(100, (currentAmount / goalAmount) * 100);

  return (
    <div className="relative w-full">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 m-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-heading font-bold text-brand-primary dark:text-brand-accent mb-2">
        {project.title}
      </h2>

      {/* Description */}
      <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mb-4">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-3 bg-brand-yellow transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          ${currentAmount.toLocaleString()} of ${goalAmount.toLocaleString()} funded
        </p>
      </div>

      {/* Metadata */}
      <p className="text-sm text-zinc-400 mb-6">
        Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown"}
      </p>

      {/* Group Payment CTA */}
      <button
        onClick={() => setGroupOpen(true)}
        className="w-full sm:w-auto py-3 px-6 text-sm font-semibold rounded-md transition flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-accent text-white"
      >
        Start Group Payment
        <Users className="w-4 h-4" />
      </button>

      <GroupPaymentModal
        isOpen={groupOpen}
        onClose={() => setGroupOpen(false)}
        project={project}
        userId={userId}
        channelUserIds={channelUserIds}
      />
    </div>
  );
}
