import Link from "next/link";
import type { NavItem } from "@/config/navigation";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

interface SidebarNavLinkProps {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}

/** One menu entry: purple pill with an edge marker when it is the current section. */
export function SidebarNavLink({ item: { route, label, icon: Icon }, active, onNavigate }: SidebarNavLinkProps) {
  return (
    <Link
      href={route}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-label font-medium transition-all duration-(--dur-quick)",
        active
          ? "bg-primary/10 font-semibold text-primary shadow-xs"
          : "text-fg-muted hover:bg-selected/60 hover:text-fg",
        focusRing,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2 -left-3 w-[3px] rounded-r-full bg-primary transition-[opacity,scale] duration-(--dur-standard) ease-standard motion-reduce:transition-none",
          active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors duration-(--dur-quick)",
          active ? "text-primary" : "text-fg-muted/70 group-hover/nav:text-primary/70",
        )}
      />
      <span className="leading-snug">{label}</span>
    </Link>
  );
}
