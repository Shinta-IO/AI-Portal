// components/admin/UserTable.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { ShieldCheck, User, Loader2 } from "lucide-react";

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export default function UserTable() {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("❌ Failed to fetch users:", error.message);
      } else {
        setUsers(data ?? []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [supabase]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-lg font-bold mb-4">Users</h2>
      {loading ? (
        <div className="flex justify-center py-6 text-zinc-500 dark:text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  {user.full_name || "Unnamed"}
                </td>
                <td className="px-4 py-2">{user.email || "—"}</td>
                <td className="px-4 py-2 capitalize">
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-brand font-semibold">
                      <ShieldCheck className="w-4 h-4" /> Admin
                    </span>
                  ) : (
                    "User"
                  )}
                </td>
                <td className="px-4 py-2">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
