"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/Sheet";

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function DetailDrawer({ open, onOpenChange, title, description, actions, children }: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="flex flex-col gap-3 border-b border-border px-6 py-5 pr-12">
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-card-title font-semibold text-fg">{title}</SheetTitle>
            <SheetDescription asChild>
              <div className="text-label text-fg-muted">{description}</div>
            </SheetDescription>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        <div className="flex min-h-0 flex-1 scroll-pt-4 flex-col gap-6 overflow-y-auto px-6 py-5 [&>*]:shrink-0">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
