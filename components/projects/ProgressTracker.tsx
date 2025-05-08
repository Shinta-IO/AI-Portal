"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { motion } from "framer-motion";

interface ProgressTrackerProps {
  projectId: string;
  isAdmin?: boolean;
  refreshTrigger?: number;
}

type Task = Database["public"]["Tables"]["project_tasks"]["Row"] & { 
  color?: string;  // Make color optional since it might not be in the database
};

const ProgressTracker = ({ projectId, isAdmin = false, refreshTrigger }: ProgressTrackerProps) => {
  const { supabase } = useSupabase();
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const table = isAdmin ? "project_tasks" : "user_visible_tasks";

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      console.error(`❌ Failed to fetch tasks from ${table}:`, error);
    } else {
      console.log(`✅ Tasks fetched from ${table}:`, data);
      setTasks(data || []);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, refreshTrigger]);

  const completionRate =
    tasks.length > 0
      ? Math.round(
          (tasks.filter((task) => task.status === "complete").length / tasks.length) * 100
        )
      : 0;

  return (
    <div className="mt-6 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-700">
      <h2 className="text-lg font-semibold mb-4">Project Progress</h2>

      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-400">No tasks available for this project.</p>
      ) : (
        <>
          <div className="mb-4 h-4 min-w-[200px] w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-blue-300"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
            {tasks.filter((task) => task.status === "complete").length} of {tasks.length} tasks complete
          </p>
        </>
      )}
    </div>
  );
};

export default ProgressTracker;
