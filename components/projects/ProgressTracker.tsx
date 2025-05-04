// components/projects/ProgressTracker.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database } from "@/types";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Circle } from "lucide-react";

interface ProgressTrackerProps {
  projectId: string;
  isAdmin?: boolean;
}

const ProgressTracker = ({ projectId, isAdmin }: ProgressTrackerProps) => {
  const supabase = useSupabaseClient<Database>();
  const [tasks, setTasks] = useState<Database["public"]["Tables"]["project_tasks"]["Row"][]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (data) setTasks(data);
    };

    fetchTasks();
  }, [projectId, supabase]);

  const updateTaskStatus = async (taskId: string, newStatus: "incomplete" | "complete" | "cancelled") => {
    await supabase.from("project_tasks").update({ status: newStatus }).eq("id", taskId);
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
  };

  const completionRate =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((task) => task.status === "complete").length / tasks.length) * 100
        )
      : 0;

  return (
    <div className="mt-6 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-700">
      <h2 className="text-lg font-semibold mb-4">Project Progress</h2>

      <div className="mb-4 h-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">{completionRate}% complete</p>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {task.status === "complete" ? (
                <CheckCircle className="text-green-500 w-5 h-5" />
              ) : task.status === "cancelled" ? (
                <XCircle className="text-red-500 w-5 h-5" />
              ) : (
                <Circle className="text-zinc-400 w-5 h-5" />
              )}
              <span className="text-sm text-zinc-800 dark:text-zinc-100">
                {task.title}
              </span>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => updateTaskStatus(task.id, "complete")}
                >
                  Mark Complete
                </button>
                <button
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => updateTaskStatus(task.id, "cancelled")}
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressTracker;
