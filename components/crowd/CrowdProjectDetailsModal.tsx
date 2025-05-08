// components/crowd/CrowdProjectDetailsModal.tsx
"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Users, Sparkles } from "lucide-react";
import type { CrowdProject } from "@/types/crowd";
import GroupPaymentModal from "@/components/crowd/GroupPaymentModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: CrowdProject;
  userId: string;
  channelUserIds: string[];
  onJoin?: () => void;
}

export default function CrowdProjectDetailsModal({
  isOpen,
  onClose,
  project,
  userId,
  channelUserIds,
  onJoin,
}: Props) {
  const [groupOpen, setGroupOpen] = useState(false);

  const current = project.current_amount ?? 0;
  const goal = project.goal_amount ?? 0;
  const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <>
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl p-6 bg-white dark:bg-zinc-900 border rounded-xl shadow-xl relative">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>

                <Dialog.Title className="text-2xl font-heading font-bold mb-2">
                  {project.title}
                </Dialog.Title>

                <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mb-4">
                  {project.long_description || project.description}
                </p>

                <div className="mb-4">
                  <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-brand-yellow transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    ${(current / 100).toLocaleString()} of ${(goal / 100).toLocaleString()} funded
                  </p>
                </div>

                <p className="text-sm text-zinc-400 mb-6">
                  Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown"}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    disabled={project.joined}
                    onClick={onJoin}
                    className={`w-full py-3 text-sm font-semibold rounded-md transition flex items-center justify-center gap-2 ${
                      project.joined
                        ? "bg-zinc-400 text-white cursor-not-allowed"
                        : "bg-brand-yellow text-black hover:bg-brand-orange"
                    }`}
                  >
                    {project.joined ? "Already Joined" : "Proceed to Join"}
                    {!project.joined && <Sparkles className="w-4 h-4" />}
                  </button>

                  {project.joined && (
                    <button
                      onClick={() => setGroupOpen(true)}
                      className="w-full py-3 text-sm font-semibold rounded-md transition flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-accent text-white"
                    >
                      Start Group Payment
                      <Users className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <GroupPaymentModal
        isOpen={groupOpen}
        onClose={() => setGroupOpen(false)}
        project={project}
        userId={userId}
        channelUserIds={channelUserIds}
      />
    </>
  );
}