import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

type BadgeCounts = {
  [key: string]: number;
};

const TAB_CONFIG = [
  { key: "messages", table: "messages" },
  { key: "invoices", table: "invoices", filterByUser: true },
  { key: "estimates", table: "estimates", filterByUser: true },
  { key: "crowd", table: "crowd_participation", filterByUser: true },
  { key: "projects", table: "project_members", filterByUser: true },
  { key: "tasks", table: "tasks", filterByUser: true }, // For project progress
];

export function useBadgeNotifications() {
  const { session, supabase } = useSupabase();
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({});

  useEffect(() => {
    const user = session?.user;
    if (!user) return;

    const fetchCounts = async () => {
      const updates: BadgeCounts = {};

      for (const { key, table, filterByUser } of TAB_CONFIG) {
        const { data: visit } = await supabase
          .from("last_visited")
          .select("visited_at")
          .eq("user_id", user.id)
          .eq("tab", `/${key === "crowd" ? "crowd" : key}`)
          .maybeSingle();

        const query = supabase
          .from(table)
          .select("*", { count: "exact", head: true })
          .gte("created_at", visit?.visited_at || "1970-01-01T00:00:00Z");

        if (filterByUser) {
          query.eq("user_id", user.id);
        }

        const { count } = await query;
        if (key !== "tasks") updates[key] = count || 0;
        else updates["projects"] = (updates["projects"] || 0) + (count || 0); // Tasks count under 'projects'
      }

      setBadgeCounts(updates);
    };

    fetchCounts();

    const subscriptions = TAB_CONFIG.map(({ table }) =>
      supabase
        .channel(table)
        .on("postgres_changes", { event: "*", schema: "public", table }, fetchCounts)
        .subscribe()
    );

    return () => {
      subscriptions.forEach((sub) => supabase.removeChannel(sub));
    };
  }, [supabase, session?.user?.id]);

  return badgeCounts;
}
