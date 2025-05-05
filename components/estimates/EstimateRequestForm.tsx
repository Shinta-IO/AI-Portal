"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, PlusCircle, Eye, CheckCircle2, XCircle } from "lucide-react";
import { createPortal } from "react-dom";
import type { Database } from "@/types";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export default function EstimateRequestForm() {
  const { supabase, session } = useSupabase();

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
      if (session?.user) {
        const { data } = await supabase
          .from("estimates")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (data) setEstimates(data);
      }
    };
    fetchEstimates();
  }, [supabase, session?.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    const budgetCents = Math.round(parseFloat(form.budget) * 100);

    await supabase.from("estimates").insert({
      user_id: session.user.id,
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
      .eq("user_id", session.user.id)
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
    </section>
  );
}
