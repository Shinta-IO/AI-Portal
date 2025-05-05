import { createSupabaseServerClient } from "@/lib/supabase";
import Layout from "@/components/Layout";
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("*, projects(id, title), channel_members(user_id)")
    .eq("id", params.channelId)
    .single();

  if (channelError || !channel) {
    return (
      <Layout>
        <div className="p-4 text-center text-red-500">
          Channel not found or failed to load.
        </div>
      </Layout>
    );
  }

  const isMember = channel.channel_members.some(
    (member) => member.user_id === user.id
  );

  if (!isMember) {
    return (
      <Layout>
        <div className="p-4 text-center text-red-500">
          You are not a member of this channel.
        </div>
      </Layout>
    );
  }

  return (
    <div className="flex h-screen">
      <MessagingSidebar currentChannelId={params.channelId} />
      <ChatWindow channel={channel} currentUserId={user.id} />
    </div>
  );
}
