"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { type Database } from "@/types";
import {
  BadgeCheck,
  Clock,
  XCircle,
  Send,
  Download,
  Trash,
} from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"] & {
  estimates: { title: string } | null;
};

export default function InvoicesPage() {
  const { supabase, session } = useSupabase();
  const user = session?.user;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";
      setRole(userRole);

      const { data, error } = await supabase
        .from("invoices")
        .select("*, estimates(title)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error.code, error.details, error.hint);
        setLoading(false);
        return;
      }

      setInvoices(
        userRole === "admin"
          ? data || []
          : (data || []).filter((inv) => inv.user_id === user.id)
      );
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <BadgeCheck className="w-4 h-4 text-green-600" />;
      case "unpaid":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handlePayment = async (invoiceId: string) => {
    setPaying(invoiceId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Unable to start payment session.");
      setPaying(null);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    setSending(invoiceId);
    await fetch("/api/email/send-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });
    setSending(null);
  };

  const cancelInvoice = async (invoiceId: string) => {
    const confirmCancel = confirm("Cancel this invoice and trigger follow-up email?");
    if (!confirmCancel) return;

    await supabase.from("invoices").update({ status: "cancelled" }).eq("id", invoiceId);

    await fetch("/api/email/invoice-abandoned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });

    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: "cancelled" } : i))
    );
  };

  const deleteInvoice = async (invoiceId: string) => {
    const confirmDelete = confirm("Permanently delete this invoice?");
    if (!confirmDelete) return;

    await supabase.from("invoices").delete().eq("id", invoiceId);
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Layout>
      <main className="px-4 sm:px-6 py-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-6 text-brand-primary dark:text-brand-accent">
          {role === "admin" ? "All Invoices" : "Your Invoices"}
        </h1>

        {invoices.length === 0 ? (
          <p className="text-zinc-500">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-brand-muted dark:border-brand-blue">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Project</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700 bg-white dark:bg-zinc-900">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-2">
                      {invoice.estimates?.title || "Untitled Project"}
                    </td>
                    <td className="px-4 py-2">${invoice.total?.toFixed(2)}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      {statusIcon(invoice.status)}
                      <span className="capitalize">{invoice.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <a
                        href={`/api/invoices/pdf?id=${invoice.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-500 hover:underline"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </a>

                      {role === "admin" && invoice.status === "unpaid" && (
                        <button
                          onClick={() => cancelInvoice(invoice.id)}
                          className="inline-flex items-center text-sm text-red-600 hover:underline"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      )}

                      {role === "admin" && invoice.status === "cancelled" && (
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="inline-flex items-center text-sm text-red-700 hover:underline"
                        >
                          <Trash className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      )}

                      {role === "admin" && invoice.status === "unpaid" && (
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          disabled={sending === invoice.id}
                          className="inline-flex items-center text-sm text-purple-600 hover:underline disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          {sending === invoice.id ? "Sending..." : "Resend"}
                        </button>
                      )}

                      {invoice.status === "unpaid" && (
                        <button
                          onClick={() => handlePayment(invoice.id)}
                          disabled={paying === invoice.id}
                          className="bg-brand-yellow text-black px-3 py-1 rounded text-sm hover:bg-brand-orange disabled:bg-zinc-400"
                        >
                          {paying === invoice.id ? "Redirecting..." : "Pay Now"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </Layout>
  );
}
