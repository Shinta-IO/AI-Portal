"use client";

import React from "react";
import { X } from "lucide-react";

type ToastProps = {
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
  onClose?: () => void;
};

export function Toast({ title, description, type = "default", onClose }: ToastProps) {
  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 min-w-[300px] rounded-md shadow-lg p-4
        ${
          type === "success"
            ? "bg-green-100 text-green-800"
            : type === "error"
            ? "bg-red-100 text-red-800"
            : type === "warning"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-white text-gray-800 dark:bg-zinc-800 dark:text-white"
        }
      `}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {title && <h3 className="font-medium text-sm">{title}</h3>}
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-zinc-400 hover:text-zinc-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 