// app/dashboard/invoices/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const supabase = createBrowserSupabaseClient<Database>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setInvoices(data);
      else console.error("Error loading invoices:", error);
    };

    fetchInvoices();

    const channel = supabase
      .channel("public:invoices")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "invoices",
        },
        (payload) => {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === payload.new.id ? (payload.new as Invoice) : inv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your Invoices</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded">
          Payment successful! 🎉 You can now{" "}
          <Link href="/dashboard/projects" className="underline font-medium">
            view your project
          </Link>
          .
        </div>
      )}

      {canceled && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded">
          Payment was canceled. If this was a mistake, please try again.
        </div>
      )}

      <div className="overflow-x-auto mt-6 rounded border border-brand-muted dark:border-brand-blue">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-bold text-pink-500">Invoice ID</th>
              <th className="px-4 py-2 text-left text-sm font-bold text-pink-500">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-bold text-pink-500">Status</th>
              <th className="px-4 py-2 text-left text-sm font-bold text-pink-500">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-700">
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-2 text-pink-700 dark:text-pink-300">{inv.id}</td>
                  <td className="px-4 py-2 text-pink-700 dark:text-pink-300">
                    ${(inv.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 capitalize text-pink-700 dark:text-pink-300">
                    {inv.status}
                  </td>
                  <td className="px-4 py-2 text-pink-700 dark:text-pink-300">
                    {new Date(inv.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-zinc-500 text-center">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
