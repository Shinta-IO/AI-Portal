"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EstimateRequestForm from "@/components/estimates/EstimateRequestForm";
import AdminEstimateManager from "@/components/estimates/AdminEstimateManager";

export default function EstimatesPage() {
  const { supabase, session } = useSupabase();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      setRole(profile?.role || "user");
      setLoading(false);
    };

    fetchRole();
  }, [session, supabase]);

  if (!session?.user || loading) {
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
          {role === "admin" ? "Manage Estimates" : "Request an Estimate"}
        </h1>
        {role === "admin" ? <AdminEstimateManager /> : <EstimateRequestForm />}
      </main>
    </Layout>
  );
}
