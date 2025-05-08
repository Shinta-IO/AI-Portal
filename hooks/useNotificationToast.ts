// hooks/useNotificationToast.ts
"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from "@/lib/supabase/SupabaseContext";

export function useNotificationToast(userId: string) {
  const { supabase } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("notification-toast")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const note = payload.new;
          toast({
            title: "📣 Notification",
            description: note.message || "You've been invited to join a project payment.",
            duration: 6000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, toast, userId]);
}
