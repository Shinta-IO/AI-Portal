"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { X, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";

const STATUS_OPTIONS = ["pending", "in-progress", "complete"];

const COLOR_OPTIONS: Record<string, { className: string; glow: string }> = {
  "brand-yellow": { className: "bg-yellow-300", glow: "shadow-[0_0_8px_rgba(255,255,0,0.6)]" },
  "brand-blue": { className: "bg-blue-400", glow: "shadow-[0_0_8px_rgba(0,255,255,0.5)]" },
  "brand-green": { className: "bg-green-400", glow: "shadow-[0_0_8px_rgba(0,255,0,0.5)]" },
  "brand-red": { className: "bg-red-400", glow: "shadow-[0_0_8px_rgba(255,0,0,0.5)]" },
  gray: { className: "bg-zinc-300", glow: "shadow-[0_0_6px_rgba(160,160,160,0.4)]" },
  purple: { className: "bg-purple-300", glow: "shadow-[0_0_8px_rgba(150,0,255,0.5)]" },
  orange: { className: "bg-orange-300", glow: "shadow-[0_0_8px_rgba(255,165,0,0.5)]" },
};

// Define a custom type for tasks that includes all needed properties
type UserVisibleTask = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  due_date: string | null;
  color?: string;
  viewer_id?: string;
  order_index?: number;
};

export default function TaskManager({
  projectId,
  onTaskChange,
}: {
  projectId: string;
  onTaskChange?: () => void;
}) {
  const { supabase } = useSupabase();
  const [tasks, setTasks] = useState<UserVisibleTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskColor, setNewTaskColor] = useState("brand-yellow");

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("user_visible_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("❌ Failed to fetch user-visible tasks:", error);
    } else {
      setTasks(data || []);
    }
  };

  const triggerUpdate = () => {
    fetchTasks();
    onTaskChange?.(); // optional callback for parent updates (like ProgressTracker)
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    // Type assertion for the insert operation
    const taskToInsert = {
      project_id: projectId,
      title: newTaskTitle,
      status: "pending",
      color: newTaskColor,
      description: "" // Adding this since it's required in the type
    };

    const { error } = await supabase.from("user_visible_tasks").insert(taskToInsert);

    if (!error) {
      setNewTaskTitle("");
      setNewTaskColor("brand-yellow");
      triggerUpdate();
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    await supabase.from("user_visible_tasks").update({ status }).eq("id", taskId);
    triggerUpdate();
  };

  const updateColor = async (taskId: string, color: string) => {
    // We're updating a field that's not in the database schema according to types
    // but apparently does exist in the actual database
    await supabase.from("user_visible_tasks").update({ color } as any).eq("id", taskId);
    triggerUpdate();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from("user_visible_tasks").delete().eq("id", taskId);
    triggerUpdate();
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return (
    <div className="w-full mt-8 space-y-4 max-w-[calc(100%-180px)] mr-auto">
      {/* Task Creator */}
      <div className="flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title"
          className="px-3 py-2 border rounded w-full dark:bg-zinc-800"
        />
        <select
          value={newTaskColor}
          onChange={(e) => setNewTaskColor(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-zinc-800"
        >
          {Object.entries(COLOR_OPTIONS).map(([key]) => (
            <option key={key} value={key}>
              {key.replace("brand-", "").replace("-", " ")}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreateTask}
          className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List */}
      <ul className="space-y-2">
        {tasks.map((task) => {
          const colorStyle = task.color ? COLOR_OPTIONS[task.color] : COLOR_OPTIONS.gray;
          
          return (
            <li
              key={task.id}
              className={clsx(
                "rounded px-4 py-2 flex justify-between items-center text-black dark:text-white",
                colorStyle.className,
                colorStyle.glow,
                "shadow-sm transition-shadow duration-200 hover:shadow-md"
              )}
            >
              <span className="font-medium text-sm">{task.title}</span>
              <div className="flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  className="text-sm px-2 py-1 rounded bg-white dark:bg-zinc-800"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <select
                  value={task.color || "gray"}
                  onChange={(e) => updateColor(task.id, e.target.value)}
                  className="text-sm px-2 py-1 rounded bg-white dark:bg-zinc-800"
                >
                  {Object.entries(COLOR_OPTIONS).map(([key]) => (
                    <option key={key} value={key}>
                      {key.replace("brand-", "").replace("-", " ")}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-zinc-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
