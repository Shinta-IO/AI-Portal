"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

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

  // Fetch user ID and initial messages
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

  // Scroll to latest
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
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
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 relative">
      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 pb-36 space-y-4">
        {loading ? (
          <div className="flex justify-center pt-10 text-zinc-500">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : (
          <>
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
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={sender}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm">
                      {sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={clsx(
                      "px-4 py-2 rounded-xl shadow max-w-xs md:max-w-md",
                      isMe
                        ? "bg-brand text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    )}
                  >
                    <div className="text-xs font-medium text-zinc-300 dark:text-zinc-400 mb-1">
                      {sender}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs text-zinc-400 text-right mt-1">
                      {time}
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="text-xs text-zinc-400 italic px-2">Someone is typing...</div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="fixed bottom-0 left-64 right-0 z-20 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1000);
          }}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded border dark:bg-zinc-800 dark:border-zinc-600"
        />
        <button
          type="submit"
          className="bg-brand text-white px-5 py-2 rounded hover:bg-brand-dark transition"
        >
          Send
        </button>
      </form>

      {/* Scrollbar styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
