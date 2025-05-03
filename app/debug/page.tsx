"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database } from "@/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function DebugPage() {
  const supabase = useSupabaseClient<Database>();
  const [status, setStatus] = useState("Initializing...");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setStatus("Fetching auth user...");
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const user = authData?.user;
        if (!user) {
          setStatus("No user logged in.");
          return;
        }

        const uid = user.id;
        setStatus(`✅ User authenticated: ${uid}`);

        const profileRes = await supabase.from("profiles").select("*").eq("id", uid).single();
        if (profileRes.error) throw profileRes.error;

        setStatus("✅ Profile loaded successfully.");

        const [estimates, invoices, participation] = await Promise.all([
          supabase.from("estimates").select("*").eq("user_id", uid),
          supabase.from("invoices").select("*").eq("user_id", uid),
          supabase.from("crowd_participation").select("*").eq("user_id", uid)
        ]);

        setResult({
          user,
          profile: profileRes.data,
          estimates: estimates.data || [],
          invoices: invoices.data || [],
          crowd_participation: participation.data || [],
        });

        setStatus("✅ All queries succeeded.");
      } catch (err) {
        setError(err);
        setStatus("❌ Error occurred during debugging.");
      }
    };

    runDiagnostics();
  }, [supabase]);

  if (!result && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
        <LoadingSpinner />
        <span className="ml-4">{status}</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 bg-brand-light dark:bg-brand-dark text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-4">🧪 Debug Report</h1>
      <p className="mb-6">{status}</p>

      {error && (
        <pre className="bg-red-100 text-red-800 p-4 rounded mb-4 whitespace-pre-wrap">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {result && (
        <div className="space-y-4 text-sm">
          <section>
            <h2 className="font-semibold text-brand-primary dark:text-brand-accent">User</h2>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded">{JSON.stringify(result.user, null, 2)}</pre>
          </section>

          <section>
            <h2 className="font-semibold text-brand-primary dark:text-brand-accent">Profile</h2>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded">{JSON.stringify(result.profile, null, 2)}</pre>
          </section>

          <section>
            <h2 className="font-semibold text-brand-primary dark:text-brand-accent">Estimates</h2>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded">{JSON.stringify(result.estimates, null, 2)}</pre>
          </section>

          <section>
            <h2 className="font-semibold text-brand-primary dark:text-brand-accent">Invoices</h2>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded">{JSON.stringify(result.invoices, null, 2)}</pre>
          </section>

          <section>
            <h2 className="font-semibold text-brand-primary dark:text-brand-accent">Crowd Participation</h2>
            <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded">{JSON.stringify(result.crowd_participation, null, 2)}</pre>
          </section>
        </div>
      )}
    </main>
  );
}
