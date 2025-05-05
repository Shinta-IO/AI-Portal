"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EstimateHistoryTable() {
  const { supabase, session } = useSupabase();
  const [estimates, setEstimates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEstimates = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("estimates")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) setEstimates(data);
    };
    fetchEstimates();
  }, [supabase, session?.user?.id]);

  const approveEstimate = async (estimate: any) => {
    await supabase.from("estimates").update({ status: "approved" }).eq("id", estimate.id);
    await supabase.from("invoices").insert({
      user_id: session?.user?.id,
      estimate_id: estimate.id,
      amount: estimate.budget,
      status: "unpaid",
    });
    setShowModal(false);
    setSelected(null);
    location.reload(); // Refresh for simplicity
  };

  const rejectEstimate = async (estimate: any) => {
    await supabase.from("estimates").update({ status: "rejected" }).eq("id", estimate.id);
    setShowModal(false);
    setSelected(null);
    location.reload();
  };

  const statusBadge = (status: string) => {
    const base = "text-xs px-2 py-1 rounded-full font-semibold";
    switch (status) {
      case "approved":
        return `${base} bg-green-100 text-green-700`;
      case "rejected":
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-yellow-100 text-yellow-700`;
    }
  };

  if (!session?.user) return null;

  return (
    <section className="mt-8 space-y-4 relative">
      <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">Your Past Estimate Requests</h2>
      <div className="overflow-x-auto rounded border border-brand-muted dark:border-brand-blue">
        <table className="min-w-full table-auto">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="p-2 text-left text-sm font-semibold">Title</th>
              <th className="p-2 text-left text-sm font-semibold">Budget</th>
              <th className="p-2 text-left text-sm font-semibold">Timeline</th>
              <th className="p-2 text-left text-sm font-semibold">Status</th>
              <th className="p-2 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((est) => (
              <tr key={est.id} className="border-t border-zinc-300 dark:border-zinc-700">
                <td className="p-2">{est.title || "Untitled"}</td>
                <td className="p-2">${est.budget}</td>
                <td className="p-2">{est.timeline || "Flexible"}</td>
                <td className="p-2"><span className={statusBadge(est.status)}>{est.status}</span></td>
                <td className="p-2 text-right">
                  <button
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setSelected(est);
                      setShowModal(true);
                    }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg w-full max-w-lg space-y-4">
              <h3 className="text-xl font-bold">Estimate Details</h3>
              <p><strong>Title:</strong> {selected.title}</p>
              <p><strong>Description:</strong> {selected.description}</p>
              <p><strong>Budget:</strong> ${selected.budget}</p>
              <p><strong>Timeline:</strong> {selected.timeline || "Flexible"}</p>
              <p><strong>Status:</strong> <span className={statusBadge(selected.status)}>{selected.status}</span></p>

              {selected.status === "pending" && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => rejectEstimate(selected)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveEstimate(selected)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve & Create Invoice
                  </button>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm text-zinc-500 hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
