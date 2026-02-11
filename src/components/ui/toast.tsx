"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  exiting?: boolean;
}

interface ToastCtx {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = ++nextId;
    setToasts([{ id, message }]);

    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 200);
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              "pointer-events-auto flex max-w-[400px] cursor-pointer items-center gap-3 rounded-lg bg-olive px-4 py-3 text-sm text-cornsilk shadow-sm",
              t.exiting ? "animate-slide-down-out" : "animate-slide-up"
            )}
          >
            <span className="flex-1">{t.message}</span>
            <X className="h-4 w-4 shrink-0 text-cornsilk/40" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
