"use client";

import { GROUPED_MENU_MIN, groupNav } from "@/config/nav-groups";
import type { NavItem } from "@/config/navigation";
import { NavSection } from "./NavSection";
import { SidebarNavLink } from "./SidebarNavLink";
import { useNavCollapse } from "./use-nav-collapse";

interface SidebarNavProps {
  items: NavItem[];
  activeId: string | null;
  onNavigate?: () => void;
}

export function SidebarNav({ items, activeId, onNavigate }: SidebarNavProps) {
  const { collapsed, toggle } = useNavCollapse();

  if (items.length < GROUPED_MENU_MIN) {
    return (
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {items.map((item) => (
          <SidebarNavLink key={item.id} item={item} active={item.id === activeId} onNavigate={onNavigate} />
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Main" className="flex flex-col">
      {groupNav(items).map((group) => {
        const holdsActive = group.items.some((item) => item.id === activeId);
        return (
          <NavSection
            key={group.id}
            group={group}
            activeId={activeId}
            open={holdsActive || !collapsed.includes(group.id)}
            onToggle={() => toggle(group.id)}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
