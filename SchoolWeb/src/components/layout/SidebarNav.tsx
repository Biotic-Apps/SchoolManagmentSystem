"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GROUPED_MENU_MIN, groupNav } from "@/config/nav-groups";
import type { NavItem } from "@/config/navigation";
import { NavSearch } from "./NavSearch";
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const matches = term
    ? items.filter((item) => item.label.toLowerCase().includes(term))
    : [];

  const search = (
    <NavSearch
      value={query}
      onChange={setQuery}
      onSubmit={() => {
        if (!matches[0]) return;
        router.push(matches[0].route);
        setQuery("");
        onNavigate?.();
      }}
    />
  );

  if (term) {
    return (
      <>
        {search}
        <nav aria-label="Main" className="flex flex-col gap-0.5">
          {matches.map((item) => (
            <SidebarNavLink
              key={item.id}
              item={item}
              active={item.id === activeId}
              onNavigate={() => {
                setQuery("");
                onNavigate?.();
              }}
            />
          ))}
          {matches.length === 0 && (
            <p className="px-3 py-6 text-center text-label text-fg-muted">
              Nothing matches “{query.trim()}”.
            </p>
          )}
        </nav>
      </>
    );
  }

  if (items.length < GROUPED_MENU_MIN) {
    return (
      <>
        {search}
        <nav aria-label="Main" className="flex flex-col gap-0.5">
          {items.map((item) => (
            <SidebarNavLink
              key={item.id}
              item={item}
              active={item.id === activeId}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </>
    );
  }

  return (
    <>
      {search}
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
    </>
  );
}
