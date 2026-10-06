import Link from "next/link";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui/styles";

interface SidebarNavProps {
  items: NavItem[];
  activeId: string | null;
  onNavigate?: () => void;
}

export function SidebarNav({ items, activeId, onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {items.map(({ id, label, route, icon: Icon }) => {
        const active = id === activeId;
        return (
          <Link
            key={id}
            href={route}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-input px-3 py-2.5 text-label font-medium transition-colors",
              active ? "bg-selected text-primary" : "text-fg-muted hover:bg-selected/50 hover:text-fg",
              focusRing,
            )}
          >
            {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
            <Icon className="size-[18px] shrink-0" />
            <span className="leading-snug">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
