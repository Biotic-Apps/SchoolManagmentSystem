"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { NavItem } from "@/config/navigation";
import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/Button";
import { DialogOverlay } from "@/components/ui/Dialog";
import { SidebarNav } from "./SidebarNav";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavItem[];
  activeId: string | null;
}

export function MobileNavDrawer({ open, onOpenChange, items, activeId }: MobileNavDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogOverlay className="lg:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,85vw)] flex-col border-r border-border bg-surface outline-none lg:hidden">
          <DialogPrimitive.Title className="sr-only">Main menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Navigate to a section</DialogPrimitive.Description>
          <div className="flex items-center justify-between px-4 py-4">
            <AppLogo subtitle="School Management" />
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            <SidebarNav items={items} activeId={activeId} onNavigate={() => onOpenChange(false)} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
