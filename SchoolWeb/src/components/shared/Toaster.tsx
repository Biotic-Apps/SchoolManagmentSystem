"use client";

import { useSyncExternalStore } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { dismissToast, getServerToasts, getToasts, subscribeToasts, type ToastTone } from "@/lib/toast";

const TONE_CLASS: Record<ToastTone, string> = {
  success: "border-success/30 bg-success-soft text-success",
  error: "border-error/30 bg-error-soft text-error",
  info: "border-info/30 bg-info-soft text-info",
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
              "pointer-events-auto flex w-full items-start gap-2 rounded-input border px-3 py-2.5 text-label shadow-sm",
              TONE_CLASS[item.tone],
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(item.id)}
              className="rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
