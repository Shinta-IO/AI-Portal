"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  channelId: string | null;
}

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_profile_full_name: string | null;
  sender_profile_avatar_url: string | null;
};

export default function MessageWindow({ channelId }: Props) {
  const { supabase } = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!channelId) return;

    const fetchInitialData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data, error } = await supabase
        .from("messages_with_profiles")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data as Message[]);
      setLoading(false);
    };

    fetchInitialData();
  }, [channelId, supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`messages:channel:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const insertedId = payload.new.id;

          const { data, error } = await supabase
            .from("messages_with_profiles")
            .select("*")
            .eq("id", insertedId)
            .single();

          if (data && !error) {
            setMessages((prev) => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);

  const sendMessage = async () => {
    if (!input.trim() || !userId || !channelId) return;

    const { error } = await supabase.from("messages").insert([
      {
        content: input.trim(),
        sender_id: userId,
        channel_id: channelId,
      },
    ]);

    if (!error) setInput("");
    else console.error("❌ Message error:", error);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative">
      <ScrollArea className="flex-1 p-4 pb-36">
        {loading ? (
          <div className="flex justify-center pt-10 text-muted-foreground">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === userId;
              const sender = msg.sender_profile_full_name || "User";
              const avatar = msg.sender_profile_avatar_url;
              const time = new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex items-start gap-3 max-w-2xl",
                    isMe ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={avatar || undefined}
                      alt={sender}
                      className="rounded-full object-cover w-full h-full"
                    />
                    <AvatarFallback>
                      {sender?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={clsx(
                      "px-4 py-2 rounded-xl shadow max-w-xs md:max-w-md",
                      isMe ? "bg-brand text-white" : "bg-muted text-foreground"
                    )}
                  >
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      {sender} — {time}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="text-xs text-muted-foreground italic px-2">
                Someone is typing...
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="fixed bottom-0 left-64 right-0 z-20 border-t border-border bg-background px-6 py-4 flex items-center gap-3"
      >
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1000);
          }}
          placeholder="Type your message..."
        />
        <Button type="submit" className="bg-brand text-white">
          Send
        </Button>
      </form>
    </div>
  );
}
