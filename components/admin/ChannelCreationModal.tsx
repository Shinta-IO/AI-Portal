"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import type { Database } from "@/types";
import { Dialog } from "@headlessui/react";
import { Switch } from "@headlessui/react";
import { CheckIcon } from "lucide-react";
import clsx from "clsx";

type User = {
  id: string;
  email: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  channelId?: string; // if provided, it's edit mode
}

export default function ChannelCreationModal({
  isOpen,
  onClose,
  currentUserId,
  channelId,
}: Props) {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<User[]>([]);
  const [channelName, setChannelName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDirect, setIsDirect] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(channelId);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email")
        .neq("id", currentUserId);

      if (!error && data) setUsers(data);
    };

    const fetchChannelDetails = async () => {
      if (!channelId) return;

      const { data: channel } = await supabase
        .from("channels")
        .select("name, is_direct")
        .eq("id", channelId)
        .single();

      if (channel) {
        setIsDirect(channel.is_direct);
        setChannelName(channel.name || "");
      }

      const { data: members } = await supabase
        .from("channel_members")
        .select("user_id")
        .eq("channel_id", channelId);

      if (members) {
        const ids = members.map((m) => m.user_id).filter((id) => id !== currentUserId);
        setSelectedUserIds(ids);
      }
    };

    if (isOpen) {
      fetchUsers();
      if (isEditMode) fetchChannelDetails();
    }
  }, [isOpen, currentUserId, channelId, supabase]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (isDirect && selectedUserIds.length !== 1) {
      alert("Direct messages must include exactly one other user.");
      return;
    }

    setLoading(true);

    if (!isEditMode) {
      // CREATE NEW CHANNEL
      const { data: channel, error } = await supabase
        .from("channels")
        .insert({
          is_direct: isDirect,
          name: isDirect ? null : channelName || null,
          created_by: currentUserId,
        })
        .select("id")
        .single();

      if (!channel || error) {
        console.error("❌ Channel creation failed", error);
        setLoading(false);
        return;
      }

      const memberIds = [...selectedUserIds, currentUserId];
      const memberInserts = memberIds.map((user_id) => ({
        channel_id: channel.id,
        user_id,
      }));

      const { error: memberError } = await supabase
        .from("channel_members")
        .insert(memberInserts);

      if (memberError) console.error("❌ Failed to add members", memberError);
    } else {
      // EDIT EXISTING CHANNEL
      await supabase
        .from("channels")
        .update({
          name: isDirect ? null : channelName || null,
        })
        .eq("id", channelId);

      const { data: existingMembers } = await supabase
        .from("channel_members")
        .select("user_id")
        .eq("channel_id", channelId);

      const currentMembers = existingMembers?.map((m) => m.user_id) ?? [];

      const updatedMembers = [...selectedUserIds, currentUserId];
      const toAdd = updatedMembers.filter((id) => !currentMembers.includes(id));
      const toRemove = currentMembers.filter((id) => !updatedMembers.includes(id));

      if (toAdd.length) {
        await supabase.from("channel_members").insert(
          toAdd.map((user_id) => ({
            channel_id: channelId,
            user_id,
          }))
        );
      }

      if (toRemove.length) {
        for (const user_id of toRemove) {
          await supabase
            .from("channel_members")
            .delete()
            .eq("channel_id", channelId)
            .eq("user_id", user_id);
        }
      }
    }

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">
            {isEditMode ? "Edit Channel" : "Create New Channel"}
          </Dialog.Title>

          {!isDirect && (
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Channel name"
              className="w-full px-3 py-2 border rounded dark:bg-zinc-800"
            />
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Users</label>
            <div className="max-h-40 overflow-y-auto space-y-1 border p-2 rounded">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className={clsx(
                    "w-full text-left px-3 py-2 rounded",
                    selectedUserIds.includes(user.id)
                      ? "bg-brand text-white"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  {user.email}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Switch
              checked={isDirect}
              onChange={setIsDirect}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition",
                isDirect ? "bg-brand" : "bg-zinc-400"
              )}
              disabled={isEditMode} // disallow changing type when editing
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition",
                  isDirect ? "translate-x-6" : "translate-x-1"
                )}
              />
            </Switch>
            <span className="text-sm">Direct Message</span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark disabled:opacity-50"
            >
              {loading
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                ? "Save"
                : "Create"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
