"use client";

import { useSyncExternalStore } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { dismissToast, getServerToasts, getToasts, subscribeToasts, type ToastTone } from "@/lib/toast";

const TONE_CLASS: Record<ToastTone, string> = {
  success: "bg-success-soft text-success",
  error: "bg-error-soft text-error",
  info: "bg-info-soft text-info",
};

const TONE_ICON = { success: CircleCheck, error: CircleAlert, info: Info };

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getServerToasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
    >
      {toasts.map((item) => {
        const Icon = TONE_ICON[item.tone];
        return (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full animate-toast-in items-start gap-3 rounded-card border border-border bg-surface p-3 text-label text-fg shadow-overlay",
            )}
          >
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", TONE_CLASS[item.tone])}>
              <Icon className="size-4" />
            </span>
            <span className="flex-1 self-center">{item.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(item.id)}
              className="rounded-md p-1 text-fg-muted transition-colors hover:bg-background hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
