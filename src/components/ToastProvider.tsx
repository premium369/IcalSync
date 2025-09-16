"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, any>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info", durationMs = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type, duration: durationMs };
    setToasts((prev) => [...prev, toast]);
    timers.current[id] = setTimeout(() => remove(id), durationMs);
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toasts container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[92vw] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-md shadow-md px-4 py-3 text-sm border",
              t.type === "success" && "bg-green-50 border-green-200 text-green-800",
              t.type === "error" && "bg-red-50 border-red-200 text-red-800",
              t.type === "info" && "bg-blue-50 border-blue-200 text-blue-800",
            ].filter(Boolean).join(" ")}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-4">
              <span>{t.message}</span>
              <button
                className="text-xs text-gray-500 hover:text-gray-800"
                onClick={() => remove(t.id)}
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}