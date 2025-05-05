"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { CheckCircle } from "lucide-react";
import clsx from "clsx";

const COLOR_OPTIONS: Record<string, { className: string; glow: string }> = {
  "brand-yellow": { className: "bg-yellow-300", glow: "shadow-[0_0_8px_rgba(255,255,0,0.6)]" },
  "brand-blue": { className: "bg-blue-400", glow: "shadow-[0_0_8px_rgba(0,255,255,0.5)]" },
  "brand-green": { className: "bg-green-400", glow: "shadow-[0_0_8px_rgba(0,255,0,0.5)]" },
  "brand-red": { className: "bg-red-400", glow: "shadow-[0_0_8px_rgba(255,0,0,0.5)]" },
  gray: { className: "bg-zinc-300", glow: "shadow-[0_0_6px_rgba(160,160,160,0.4)]" },
  purple: { className: "bg-purple-300", glow: "shadow-[0_0_8px_rgba(150,0,255,0.5)]" },
  orange: { className: "bg-orange-300", glow: "shadow-[0_0_8px_rgba(255,165,0,0.5)]" },
};

type UserVisibleTask = Database["public"]["Views"]["user_visible_tasks"]["Row"];

export default function TaskViewer({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) {
  const { supabase } = useSupabase();
  const [tasks, setTasks] = useState<UserVisibleTask[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("user_visible_tasks")
        .select("*")
        .eq("project_id", projectId)
        .eq("viewer_id", userId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("❌ Failed to fetch user-visible tasks:", error);
      } else {
        setTasks(data || []);
      }
    };

    fetchTasks();
  }, [projectId, userId, supabase]);

  return (
    <div className="mt-6 max-w-[calc(100%-180px)] mr-auto space-y-3">
      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-400">No tasks available for this project.</p>
      ) : (
        tasks.map((task) => {
          const colorStyle = COLOR_OPTIONS[task.color] || COLOR_OPTIONS.gray;
          return (
            <div
              key={task.id}
              className={clsx(
                "flex items-center justify-between px-4 py-2 rounded text-black dark:text-white shadow-sm",
                colorStyle.className,
                colorStyle.glow
              )}
            >
              <span className="font-medium text-sm">{task.title}</span>
              {task.status === "complete" && (
                <span className="flex items-center gap-2 text-sm text-black dark:text-black">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
