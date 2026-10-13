"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { findNavByRoute } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { IconTile } from "./IconTile";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Tile beside the title; defaults to the menu icon of the current section. */
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

/** Page title + one-line description on the left, actions aligned right (stacked on phones). */
export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  const segment = usePathname()?.split("/")[1] ?? "";
  const tileIcon = icon ?? findNavByRoute(segment)?.icon;
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-3.5">
        {tileIcon && <IconTile icon={tileIcon} size="lg" className="hidden sm:grid" />}
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-[24px] font-bold leading-8 tracking-[-0.02em] text-fg sm:text-page-title">{title}</h1>
          {description && <p className="max-w-3xl text-label text-fg-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
