"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { loadStripe } from "@stripe/stripe-js";
import { Sparkles, X } from "lucide-react";
import { useSupabase } from "@/lib/supabase/SupabaseContext";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Participant = {
  user_id: string;
  name: string;
  avatar_url?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    title: string;
    goal_amount: number; // in cents
  };
  userId: string;
  channelUserIds: string[];
};

export default function GroupPaymentModal({
  isOpen,
  onClose,
  project,
  userId,
  channelUserIds,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([userId]));
  const { supabase } = useSupabase();

  const selectedCount = selectedIds.size;
  const canSubmit = selectedCount >= 2;

  const rawAmount = project.goal_amount; // cents
  const splitAmountCents = Math.round(rawAmount / Math.max(selectedCount, 1));

  const formatUSD = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);

  const displayAmountDollars = formatUSD(splitAmountCents / 100);
  const totalAmountDollars = formatUSD(rawAmount / 100);

  useEffect(() => {
    const loadParticipants = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", channelUserIds);

      if (error) {
        console.error("❌ Failed to load profiles:", error);
        return;
      }

      const formatted = data.map((u) => ({
        user_id: u.id,
        name: u.name || "Unknown",
        avatar_url: u.avatar_url || undefined,
      }));

      setParticipants(formatted);
    };

    if (isOpen) loadParticipants();
  }, [isOpen, channelUserIds, supabase]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated.size === 0 ? new Set([userId]) : updated;
    });
  };

  const notifyOtherUsers = async (userIds: string[]) => {
    try {
      console.log("📨 Notifying other users:", userIds);
    } catch (err) {
      console.error("❌ Failed to notify users:", err);
    }
  };

  const handleConfirm = async () => {
    if (selectedCount < 2) {
      alert("You must select at least one additional participant to proceed with group payment.");
      return;
    }

    setLoading(true);

    try {
      const participantArray = Array.from(selectedIds).map((id) => ({
        userId: id,
        amount: splitAmountCents, // cents
      }));

      const res = await fetch("/api/stripe/group-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          requesterId: userId,
          participants: participantArray,
        }),
      });

      const { sessionId, error } = await res.json();
      if (error || !sessionId) throw new Error(error || "Session failed");

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });

      const otherUsers = participantArray.map((p) => p.userId).filter((id) => id !== userId);
      if (otherUsers.length > 0) await notifyOtherUsers(otherUsers);
    } catch (err) {
      console.error("❌ Stripe group error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg p-6 bg-white dark:bg-zinc-900 rounded-xl border border-brand-muted shadow-xl relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>

              <Dialog.Title className="text-xl font-heading font-bold mb-2">
                Select Participants
              </Dialog.Title>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                Total: {totalAmountDollars} — Divided by {selectedCount} = {displayAmountDollars} each
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2 mb-6">
                {participants.map((p) => (
                  <div
                    key={p.user_id}
                    onClick={() => toggleSelection(p.user_id)}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${
                      selectedIds.has(p.user_id)
                        ? "bg-green-100 dark:bg-green-800"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    <Image
                      src={p.avatar_url || "/default-avatar.png"}
                      alt={p.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="text-sm">{p.name}</span>
                    {selectedIds.has(p.user_id) && (
                      <span className="ml-auto text-xs text-green-600 dark:text-green-300 font-bold">
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={loading || !canSubmit}
                className="w-full py-3 text-sm font-bold bg-brand-yellow text-black rounded-md hover:bg-brand-orange transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm and Pay"}
                {!loading && <Sparkles className="w-4 h-4" />}
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
