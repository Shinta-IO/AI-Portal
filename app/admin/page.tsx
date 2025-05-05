"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import Layout from "@/components/Layout";
import ProjectCards from "@/components/admin/ProjectCards";
import UserTable from "@/components/admin/UserTable";
import ChannelCreationTool from "@/components/admin/ChannelCreationModal";

export default function AdminPanelPage() {
  const { supabase } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && profile?.role === "admin") {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    loadUser();
  }, [supabase]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center text-zinc-500 dark:text-zinc-400">Loading...</div>
      </Layout>
    );
  }

  if (!userId) {
    return (
      <Layout>
        <div className="p-6 text-center text-red-500">Not logged in</div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-6 text-center text-red-500">Access denied. Admins only.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <ProjectCards />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <UserTable />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Message Channels</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark transition"
          >
            Create New Channel
          </button>
          {showModal && userId && (
            <ChannelCreationTool
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              currentUserId={userId}
            />
          )}
        </section>
      </div>
    </Layout>
  );
}
