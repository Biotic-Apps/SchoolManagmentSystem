import { ChevronDown } from "lucide-react";
import type { NavGroup } from "@/config/nav-groups";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { SidebarNavLink } from "./SidebarNavLink";

interface NavSectionProps {
  group: NavGroup;
  activeId: string | null;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

/** Labelled, foldable block of menu entries; the section holding the current page always stays open. */
export function NavSection({ group, activeId, open, onToggle, onNavigate }: NavSectionProps) {
  const bodyId = `nav-section-${group.id}`;
  const links = group.items.map((item) => (
    <SidebarNavLink key={item.id} item={item} active={item.id === activeId} onNavigate={onNavigate} />
  ));
  if (!group.label) return <div className="flex flex-col gap-0.5">{links}</div>;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between rounded-md px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted/80 transition-colors duration-(--dur-quick) hover:text-fg",
          focusRing,
        )}
      >
        {group.label}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 transition-transform duration-(--dur-quick) ease-standard motion-reduce:transition-none",
            !open && "-rotate-90",
          )}
        />
      </button>
      <div
        id={bodyId}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-(--dur-standard) ease-standard motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* -mx-3/px-3 + clip margin keep the active edge marker and focus rings visible while the
            fold still clips during the height transition; inert keeps folded links out of tab order. */}
        <div
          className="-mx-3 flex min-h-0 flex-col gap-0.5 overflow-clip px-3 [overflow-clip-margin:4px]"
          inert={!open}
        >
          {links}
        </div>
      </div>
    </div>
  );
}
