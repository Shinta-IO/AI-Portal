 // components/crowd/CrowdSuccessModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { CheckCircle, Download, ReceiptText } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CrowdSuccessModal({ isOpen, onClose }: Props) {
  const router = useRouter();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={onClose} className="relative z-50">
        {/* Overlay */}
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

        {/* Modal Content */}
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
            <Dialog.Panel className="w-full max-w-md rounded-xl border border-brand-muted bg-white dark:bg-zinc-900 p-6 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="text-green-500 w-12 h-12 mb-4" />
                <Dialog.Title className="text-xl font-bold text-brand-primary dark:text-brand-yellow mb-2">
                  Payment Successful!
                </Dialog.Title>
                <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                  You’ve joined this crowd project. Your invoice is available now.
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      router.push("/invoices");
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm font-medium text-black bg-brand-yellow hover:bg-brand-orange rounded-md transition"
                  >
                    <ReceiptText className="w-4 h-4" />
                    Go to Invoices
                  </button>

                  <button
                    onClick={() => {
                      router.push("/invoices?download=latest");
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm font-medium text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice PDF
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
