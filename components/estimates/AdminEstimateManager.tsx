"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { MoreVertical, Trash, Eye, Send } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

type Estimate = Database["public"]["Tables"]["estimates"]["Row"];

export default function AdminEstimateManager() {
  const { supabase } = useSupabase();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [editedEstimate, setEditedEstimate] = useState<Partial<Estimate>>({});
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const fetchEstimates = async () => {
    const { data } = await supabase
      .from("estimates")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setEstimates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownOpen &&
        !(e.target as HTMLElement).closest("[data-dropdown-button], [data-dropdown-menu]")
      ) {
        setDropdownOpen(null);
        setButtonPosition(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const deleteEstimate = async (id: string) => {
    await supabase.from("estimates").delete().eq("id", id);
    setEstimates((prev) => prev.filter((e) => e.id !== id));
  };

  const sendEstimateToUser = async () => {
    if (!selectedEstimate) return;

    const { total, ...safeEstimate } = editedEstimate;

    const finalEstimate = {
      ...safeEstimate,
      status: "pending_user",
    };

    const { error } = await supabase
      .from("estimates")
      .update(finalEstimate)
      .eq("id", selectedEstimate.id);

    if (error) {
      console.error("❌ Supabase update error:", error);
      alert("Failed to finalize estimate. See console.");
      return;
    }

    setEstimates((prev) =>
      prev.map((e) => (e.id === selectedEstimate.id ? { ...e, ...finalEstimate } : e))
    );

    setSelectedEstimate(null);
    setEditedEstimate({});
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const base = "px-2 py-1 rounded text-xs font-semibold capitalize";
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
      pending_user: "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400",
    };
    return <span className={`${base} ${colors[status as keyof typeof colors] || ""}`}>{status}</span>;
  };

  const DropdownPortal = ({ est }: { est: Estimate }) => {
    if (!buttonPosition) return null;
    return createPortal(
      <div
        data-dropdown-menu
        className="fixed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-md w-40 text-sm"
        style={{ top: buttonPosition.top + 35, left: buttonPosition.left - 160, zIndex: 9999 }}
      >
        <button
          onClick={() => {
            setSelectedEstimate(est);
            setEditedEstimate(est);
            setDropdownOpen(null);
            setButtonPosition(null);
          }}
          className="w-full flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Eye className="w-4 h-4 mr-2" /> View/Edit
        </button>
        <button
          onClick={() => {
            deleteEstimate(est.id);
            setDropdownOpen(null);
            setButtonPosition(null);
          }}
          className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Trash className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>,
      document.body
    );
  };

  return (
    <section className="overflow-x-auto max-w-6xl mx-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      ) : estimates.length === 0 ? (
        <p className="text-zinc-500">No estimates found.</p>
      ) : (
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-900 shadow rounded-lg overflow-hidden">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="text-left text-sm font-bold px-4 py-2">Title</th>
              <th className="text-left text-sm font-bold px-4 py-2">Description</th>
              <th className="text-left text-sm font-bold px-4 py-2">Total ($)</th>
              <th className="text-left text-sm font-bold px-4 py-2">Timeline</th>
              <th className="text-left text-sm font-bold px-4 py-2">Status</th>
              <th className="text-sm font-bold px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {estimates.map((est) => (
              <tr key={est.id}>
                <td className="px-4 py-2 text-sm">{est.title}</td>
                <td className="px-4 py-2 text-sm truncate">{est.description}</td>
                <td className="px-4 py-2 text-sm">${Number(est.total).toFixed(2)}</td>
                <td className="px-4 py-2 text-sm">{est.timeline}</td>
                <td className="px-4 py-2"><StatusBadge status={est.status} /></td>
                <td className="px-4 py-2 text-right">
                  <button
                    data-dropdown-button
                    ref={(el) => {
                      buttonRefs.current[est.id] = el;
                    }}
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                      if (rect) setButtonPosition({ top: rect.top, left: rect.left });
                      setDropdownOpen(dropdownOpen === est.id ? null : est.id);
                    }}
                    className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {dropdownOpen === est.id && <DropdownPortal est={est} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AnimatePresence>
        {selectedEstimate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-700 space-y-4">
              <h3 className="text-xl font-bold">Finalize Estimate</h3>
              <div className="space-y-2">
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-zinc-800"
                  value={editedEstimate.title || ""}
                  onChange={(e) =>
                    setEditedEstimate((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Title"
                />
                <textarea
                  className="w-full px-3 py-2 rounded border dark:bg-zinc-800"
                  rows={3}
                  value={editedEstimate.description || ""}
                  onChange={(e) =>
                    setEditedEstimate((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Description"
                />
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-zinc-800"
                  value={editedEstimate.budget?.toString() || ""}
                  onChange={(e) =>
                    setEditedEstimate((prev) => ({ ...prev, budget: Number(e.target.value) }))
                  }
                  placeholder="Budget (in cents)"
                  type="number"
                />
                <input
                  className="w-full px-3 py-2 rounded border dark:bg-zinc-800"
                  value={editedEstimate.timeline || ""}
                  onChange={(e) =>
                    setEditedEstimate((prev) => ({ ...prev, timeline: e.target.value }))
                  }
                  placeholder="Timeline"
                />
              </div>
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    setSelectedEstimate(null);
                    setEditedEstimate({});
                  }}
                  className="px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEstimateToUser}
                  className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send to User
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
