// app/messages/[channelId]/page.tsx
import ConversationList from "@/components/messages/ConversationList";
import MessageWindow from "@/components/messages/MessageWindow";
import { redirect } from "next/navigation";
import type { Database } from "@/types";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Channel type with related project and membership info
type Channel = Database["public"]["Tables"]["channels"]["Row"] & {
  projects: Pick<Database["public"]["Tables"]["projects"]["Row"], "id" | "title"> | null;
  channel_members: { user_id: string }[];
};

// Server-side Supabase client with cookie support
async function getServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookieStore.get(key)?.value ?? null,
      },
    }
  );
}

// ✅ Server component page handler
export default async function ChannelPage({ params }: { params: { channelId: string } }) {
  const supabase = await getServerClient();

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
      <div className="flex items-center justify-center h-screen text-red-500">
        Channel not found or failed to load.
      </div>
    );
  }

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

  return (
    <div className="flex h-screen">
      <ConversationList onSelectChannel={() => {}} />
      <MessageWindow channelId={channel.id} />
    </div>
  );
}
