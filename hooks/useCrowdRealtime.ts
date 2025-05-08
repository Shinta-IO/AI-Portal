// /hooks/useCrowdRealtime.ts
import { useEffect } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export function useCrowdRealtime(projectId: string, onUpdate: () => void) {
  const { supabase } = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel(`crowd_participation:${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crowd_participation", filter: `crowd_project_id=eq.${projectId}` },
        onUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase, onUpdate]);
}
