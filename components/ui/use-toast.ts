"use client";

import { useState, useCallback } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  type?: "default" | "success" | "error" | "warning";
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, duration = 3000, type = "default" }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { title, description, duration, type }]);
    
    // For now, this is just a stub implementation that doesn't actually show toasts in the UI
    // In a real implementation, this would add the toast to the DOM and remove it after duration
    console.log(`Toast [${type}]: ${title} - ${description}`);
    
    return id;
  }, []);

  return { toast, toasts };
} 