"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DialogOverlay } from "./Dialog";
import { focusRing } from "./styles";

export const Sheet = DialogPrimitive.Root;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export const SheetContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function SheetContent({ className, children, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-border/50 bg-surface shadow-overlay outline-none sm:rounded-l-2xl",
          "data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn("absolute right-4 top-5 rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-selected hover:text-fg", focusRing)}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
