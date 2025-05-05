"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import clsx from "clsx";

interface Props {
  onSelectChannel: (channelId: string) => void;
}

type Channel = {
  id: string;
  name: string | null;
  is_direct: boolean;
};

export default function ConversationList({ onSelectChannel }: Props) {
  const { supabase } = useSupabase();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      const {
        data,
        error,
      } = await supabase
        .from("channel_members")
        .select("channel_id, channels(id, name, is_direct)")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (!error && data) {
        const parsed = data
          .map((entry) => entry.channels)
          .filter(Boolean) as Channel[];
        setChannels(parsed);
      }
    };

    fetchChannels();
  }, [supabase]);

  const handleClick = (id: string) => {
    setActiveId(id);
    onSelectChannel(id);
  };

  return (
    <aside className="border-r border-zinc-200 dark:border-zinc-700 p-4 space-y-2 overflow-y-auto">
      <h3 className="text-sm font-semibold uppercase text-zinc-500 mb-2">Channels</h3>
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => handleClick(channel.id)}
          className={clsx(
            "w-full text-left px-3 py-2 rounded transition",
            activeId === channel.id
              ? "bg-brand text-white"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          {channel.is_direct ? "Direct Message" : channel.name || "Unnamed Channel"}
        </button>
      ))}
    </aside>
  );
}
