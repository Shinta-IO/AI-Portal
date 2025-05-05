// app/messages/page.tsx
"use client";

import ConversationList from "@/components/messages/ConversationList";
import MessageWindow from "@/components/messages/MessageWindow";
import { useState } from "react";
import Layout from "@/components/Layout";

export default function MessagesPage() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[calc(100vh-4rem)]">
        <ConversationList onSelectChannel={setActiveChannelId} />
        <MessageWindow channelId={activeChannelId} />
      </div>
    </Layout>
  );
}
