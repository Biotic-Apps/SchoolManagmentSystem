"use client";

import type { NavItem } from "@/config/navigation";
import { AppLogo } from "@/components/shared/AppLogo";
import { useSession } from "@/features/auth/session-context";
import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SidebarNav } from "./SidebarNav";

interface SidebarProps {
  items: NavItem[];
  activeId: string | null;
}

export function Sidebar({ items, activeId }: SidebarProps) {
  const { session } = useSession();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh w-68 shrink-0 flex-col bg-surface lg:flex",
        "border-r border-border/50 shadow-sm",
        "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
      )}
    >
      {/* Logo header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-5">
        <AppLogo subtitle="School Management" />
      </div>

      {/* User profile card */}
      {session && (
        <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl bg-selected/60 px-3 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-label font-semibold text-on-primary shadow-xs">
            {initials(session.user.name)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-label font-semibold text-fg">{session.user.name}</span>
            <span className="truncate text-caption text-fg-muted capitalize">{session.activeRole?.toLowerCase().replace("_", " ")}</span>
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:thin]">
        <SidebarNav items={items} activeId={activeId} />
      </div>
    </aside>
  );
}
