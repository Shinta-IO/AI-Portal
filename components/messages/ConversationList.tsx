"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  onSelectChannel: (channelId: string) => void;
}

type Channel = {
  id: string;
  name: string | null;
  is_direct: boolean;
};

const ADMIN_USER_ID = "0e68abb9-9316-48af-b365-320cf70fe061";

export default function ConversationList({ onSelectChannel }: Props) {
  const { supabase } = useSupabase();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        console.error("Failed to get user:", userError);
        setLoading(false);
        return;
      }

      const uid = user.id;
      setUserId(uid);

      const { data: memberships, error: memberError } = await supabase
        .from("channel_members")
        .select("channel_id")
        .eq("user_id", uid);

      if (memberError || !memberships) {
        console.error("Failed to fetch channel memberships:", memberError);
        setChannels([]);
        setLoading(false);
        return;
      }

      const channelIds = memberships.map((m) => m.channel_id);

      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .select("id, name, is_direct")
        .in("id", channelIds);

      const userHasDM = channelData?.some((ch) => ch.is_direct) ?? false;

      const finalChannels = [...(channelData ?? [])];

      if (!userHasDM) {
        finalChannels.push({ id: "admin-dm", name: null, is_direct: true });
      }

      setChannels(finalChannels);
      setLoading(false);
    };

    fetchChannels();
  }, [supabase]);

  const handleClick = async (id: string) => {
    if (id === "admin-dm" && userId) {
      const { data: existingMemberships } = await supabase
        .from("channel_members")
        .select("channel_id")
        .eq("user_id", userId);

      const existingChannelIds = existingMemberships?.map((m) => m.channel_id) ?? [];

      const { data: direct } = await supabase
        .from("channels")
        .select("id")
        .eq("is_direct", true)
        .in("id", existingChannelIds);

      let channelId = direct?.[0]?.id;

      if (!channelId) {
        const { data: newChannel, error: createError } = await supabase
          .from("channels")
          .insert({ is_direct: true, created_by: ADMIN_USER_ID })
          .select()
          .single();

        if (createError || !newChannel) {
          console.error("Failed to create DM channel:", createError);
          return;
        }

        channelId = newChannel.id;

        const { error: memberError } = await supabase.from("channel_members").insert([
          { user_id: userId, channel_id: channelId },
          { user_id: ADMIN_USER_ID, channel_id: channelId },
        ]);

        if (memberError) {
          console.error("Failed to insert DM members:", memberError);
        }
      }

      setActiveId(channelId);
      onSelectChannel(channelId);
    } else {
      setActiveId(id);
      onSelectChannel(id);
    }
  };

  return (
    <aside className="h-full border-r border-border bg-background flex flex-col">
      <div className="p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Channels
        </h3>
      </div>
      <ScrollArea className="flex-1 px-2 pb-4">
        {loading ? (
          <div className="space-y-3 px-2">
            <Skeleton className="h-8 rounded-md" />
            <Skeleton className="h-8 rounded-md" />
            <Skeleton className="h-8 rounded-md" />
          </div>
        ) : (
          <div className="space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeId === channel.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start px-3 py-2 text-sm font-medium transition",
                  activeId !== channel.id &&
                    "hover:bg-muted hover:text-foreground"
                )}
                onClick={() => handleClick(channel.id)}
              >
                {channel.is_direct ? (
                  <>
                    <Badge variant="outline" className="mr-2">
                      DM
                    </Badge>
                    Direct Message
                  </>
                ) : (
                  channel.name || "Unnamed Channel"
                )}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
