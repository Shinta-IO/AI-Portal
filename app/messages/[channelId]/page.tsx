// app/messages/[channelId]/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MessagingSidebar from "@/components/messages/MessagingSidebar";
import ChatWindow from "@/components/messages/ChatWindow";
import { redirect } from "next/navigation";
import type { Database } from "@/types";

type Channel = Database["public"]["Tables"]["channels"]["Row"] & {
  projects: Pick<Database["public"]["Tables"]["projects"]["Row"], "id" | "title"> | null;
  channel_members: { user_id: string }[];
};

export default async function ChannelPage({
  params,
}: {
  params: { channelId: string };
}) {
  const supabase = await createSupabaseServerClient();

  // 🔐 Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 📦 Fetch channel with member and project info
  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("*, projects(id, title), channel_members(user_id)")
    .eq("id", params.channelId)
    .single();

  if (channelError || !channel) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Channel not found or failed to load.
      </div>
    );
  }

  // ❌ Access Control
  const isMember = channel.channel_members.some(
    (member) => member.user_id === user.id
  );

  if (!isMember) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        You are not a member of this channel.
      </div>
    );
  }

  // ✅ Render sidebar + chat
  return (
    <div className="flex h-screen">
      <MessagingSidebar currentChannelId={params.channelId} />
      <ChatWindow channel={channel} currentUserId={user.id} />
    </div>
  );
}
