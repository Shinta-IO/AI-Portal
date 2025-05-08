"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import ProgressTracker from "./ProgressTracker";
import TaskManager from "./TaskManager";

import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown, Plus, X, Trash2 } from "lucide-react";
import clsx from "clsx";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function AdminProjectsTable() {
  const { supabase, session } = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProjects(data);
  }, [supabase]);

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("last_name", { ascending: true });
    if (data) setProfiles(data);
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
    fetchProfiles();
  }, [fetchProjects, fetchProfiles]);

  const handleCreateProject = async () => {
    if (!session?.user?.id) {
      alert("Missing user session. Cannot create project.");
      return;
    }

    const { data: newProject, error } = await supabase
      .from("projects")
      .insert({
        title: newTitle,
        description: newDescription,
        status: "active",
        client_id: session.user.id,
      })
      .select()
      .single();

    if (error || !newProject) {
      alert("Failed to create project.");
      return;
    }

    const assignments = selectedUsers.map((profile) => ({
      project_id: newProject.id,
      user_id: profile.id,
    }));

    const { error: linkError } = await supabase.from("project_members").insert(assignments);
    if (linkError) alert("Project created but failed to assign users.");

    setNewTitle("");
    setNewDescription("");
    setSelectedUsers([]);
    setModalOpen(false);
    fetchProjects();
  };

  const handleDeleteProject = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this project?");
    if (!confirm) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      fetchProjects();
      if (selectedProjectId === id) setSelectedProjectId(null);
    } else {
      alert("Failed to delete project.");
    }
  };

  const removeUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-900 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Created</th>
            <th className="px-4 py-2 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
          {projects.map((project) => (
            <tr
              key={project.id}
              className={`cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                selectedProjectId === project.id ? "bg-zinc-50 dark:bg-zinc-800/50" : ""
              }`}
              onClick={() => setSelectedProjectId((prev) => (prev === project.id ? null : project.id))}
            >
              <td className="px-4 py-2 text-sm font-medium">{project.title}</td>
              <td className="px-4 py-2 text-sm">{project.description}</td>
              <td className="px-4 py-2 text-sm capitalize">{project.status}</td>
              <td className="px-4 py-2 text-sm">{new Date(project.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-sm text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProjectId && (
        <>
          <div className="mt-4">
            <ProgressTracker projectId={selectedProjectId} isAdmin />
          </div>
          <div className="mt-4 w-full">
            <TaskManager projectId={selectedProjectId} />
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Project</h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              className="w-full px-3 py-2 rounded border dark:bg-zinc-800"
              placeholder="Project Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="w-full px-3 py-2 rounded border dark:bg-zinc-800"
              rows={3}
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <div>
              <label className="block font-medium mb-1">Assign Users:</label>
              <Listbox
                value={null}
                onChange={(profile) => {
                  if (!selectedUsers.find((u) => u.id === profile.id)) {
                    setSelectedUsers([...selectedUsers, profile]);
                  }
                }}
              >
                <div className="relative">
                  <Listbox.Button className="w-full bg-zinc-50 dark:bg-zinc-800 border px-3 py-2 rounded text-left">
                    <span>Select user to add</span>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-2.5" />
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-900 border rounded shadow-lg max-h-60 overflow-auto">
                      {profiles.map((profile) => (
                        <Listbox.Option
                          key={profile.id}
                          value={profile}
                          className={({ active }) =>
                            clsx("cursor-pointer px-4 py-2", active && "bg-brand/10 dark:bg-brand/20")
                          }
                        >
                          {({ selected }) => (
                            <div className="flex justify-between items-center">
                              <span>
                                {profile.first_name} {profile.last_name}
                              </span>
                              {selectedUsers.find((u) => u.id === profile.id) && (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap mt-2 gap-2">
                  {selectedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center bg-zinc-200 dark:bg-zinc-800 text-sm px-3 py-1 rounded-full"
                    >
                      {u.first_name} {u.last_name}
                      <button
                        className="ml-2 text-zinc-600 hover:text-red-500"
                        onClick={() => removeUser(u.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateProject}
              className="w-full bg-brand text-white py-2 rounded hover:bg-brand-dark"
            >
              Create Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
