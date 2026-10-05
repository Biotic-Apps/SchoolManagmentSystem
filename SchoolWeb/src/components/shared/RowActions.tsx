"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/cn";

export interface RowAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  hidden?: boolean;
  danger?: boolean;
}

export function RowActions({ actions, label = "Row actions" }: { actions: RowAction[]; label?: string }) {
  const visible = actions.filter((action) => !action.hidden);
  if (visible.length === 0) return null;
  return (
    <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" aria-label={label}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {visible.map(({ id, label: text, icon: Icon, onSelect, danger }) => (
            <DropdownMenuItem key={id} onSelect={onSelect} className={cn(danger && "text-error [&_svg]:text-error")}>
              {Icon && <Icon />}
              {text}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
