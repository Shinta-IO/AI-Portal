// components/estimates/EstimateRequestForm.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, PlusCircle, Eye, CheckCircle2, XCircle } from "lucide-react";
import { createPortal } from "react-dom";
import type { Database } from "@/types";

export default function EstimateRequestForm() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  const [estimates, setEstimates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    timeline: "",
    budget: ""
  });

  useEffect(() => {
    const fetchEstimates = async () => {
      if (user) {
        const { data } = await supabase
          .from("estimates")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setEstimates(data);
      }
    };
    fetchEstimates();
  }, [supabase, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const budgetCents = Math.round(parseFloat(form.budget) * 100);

    await supabase.from("estimates").insert({
      user_id: user.id,
      title: form.title || "Untitled",
      description: form.description,
      timeline: form.timeline,
      budget: budgetCents,
      status: "pending"
    });

    setShowForm(false);
    setForm({ title: "", description: "", timeline: "", budget: "" });

    const { data } = await supabase
      .from("estimates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setEstimates(data);
  };

  const approveEstimate = async (id: string) => {
    const { data: estimate } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();

    if (!estimate) return;

    await supabase.from("estimates").update({ status: "approved" }).eq("id", id);

    await supabase.from("invoices").insert({
      user_id: estimate.user_id,
      estimate_id: estimate.id,
      amount: estimate.budget,
      status: "unpaid"
    });

    setEstimates((prev) => prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e)));
    setSelectedEstimate(null);
  };

  const rejectEstimate = async (id: string) => {
    await supabase.from("estimates").update({ status: "rejected" }).eq("id", id);
    setEstimates((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)));
    setSelectedEstimate(null);
  };

  const DropdownPortal = ({ est }: { est: any }) => {
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
            setDropdownOpen(null);
            setButtonPosition(null);
          }}
          className="w-full flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Eye className="w-4 h-4 mr-2" /> View
        </button>
        {est.status === "pending_user" && (
          <>
            <button
              onClick={() => {
                approveEstimate(est.id);
                setDropdownOpen(null);
                setButtonPosition(null);
              }}
              className="w-full flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-green-600"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
            </button>
            <button
              onClick={() => {
                rejectEstimate(est.id);
                setDropdownOpen(null);
                setButtonPosition(null);
              }}
              className="w-full flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600"
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </button>
          </>
        )}
      </div>,
      document.body
    );
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-heading font-bold text-brand-primary dark:text-brand-accent">
          Your Past Estimate Requests
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-yellow text-black rounded-md hover:bg-brand-orange transition"
        >
          <PlusCircle className="w-5 h-5" />
          New Request
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-brand-muted dark:border-brand-blue">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-orange-500">Description</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-blue-500">Budget</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Timeline</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-2 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
            {estimates.map((est) => (
              <tr key={est.id}>
                <td className="px-4 py-2">{est.title}</td>
                <td className="px-4 py-2 text-orange-400">{est.description}</td>
                <td className="px-4 py-2 text-blue-400">${(est.budget / 100).toFixed(2)}</td>
                <td className="px-4 py-2">{est.timeline || "Flexible"}</td>
                <td className="px-4 py-2 capitalize">{est.status}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    data-dropdown-button
                    ref={(el) => (buttonRefs.current[est.id] = el)}
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
      </div>

      {/* New Estimate Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl w-full max-w-md space-y-4 border border-brand-muted dark:border-brand-blue"
            >
              <h3 className="text-xl font-bold">Submit New Estimate</h3>
              <div>
                <label className="block text-sm font-semibold mb-1">Title (optional)</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-500 mb-1">Description *</label>
                <textarea name="description" required value={form.description} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Timeline (optional)</label>
                <select name="timeline" value={form.timeline} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800">
                  <option value="">Select...</option>
                  <option value="1-2 weeks">1–2 weeks</option>
                  <option value="2-4 weeks">2–4 weeks</option>
                  <option value="4-8 weeks">4–8 weeks</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-500 mb-1">Budget ($USD) *</label>
                <input name="budget" required type="number" step="0.01" value={form.budget} onChange={handleChange} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-400 text-white rounded hover:bg-zinc-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-yellow text-black rounded hover:bg-brand-orange">
                  Submit Estimate Request
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimate Review Modal */}
      <AnimatePresence>
        {selectedEstimate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 border border-brand-muted dark:border-brand-blue space-y-4">
              <h3 className="text-xl font-bold">Review Admin Estimate</h3>
              <p><strong>Title:</strong> {selectedEstimate.title}</p>
              <p><strong>Description:</strong> {selectedEstimate.description}</p>
              <p><strong>Budget:</strong> ${(selectedEstimate.budget / 100).toFixed(2)}</p>
              <p><strong>Timeline:</strong> {selectedEstimate.timeline || "Flexible"}</p>
              <div className="flex justify-between pt-4">
                <button onClick={() => setSelectedEstimate(null)} className="px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600">Close</button>
                <div className="flex gap-2">
                  <button onClick={() => approveEstimate(selectedEstimate.id)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                  <button onClick={() => rejectEstimate(selectedEstimate.id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
