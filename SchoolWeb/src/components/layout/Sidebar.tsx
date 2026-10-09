import type { NavItem } from "@/config/navigation";
import { AppLogo } from "@/components/shared/AppLogo";
import { SidebarNav } from "./SidebarNav";

interface SidebarProps {
  items: NavItem[];
  activeId: string | null;
}

export function Sidebar({ items, activeId }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <AppLogo subtitle="School Management" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:thin]">
        <SidebarNav items={items} activeId={activeId} />
      </div>
    </aside>
  );
}
