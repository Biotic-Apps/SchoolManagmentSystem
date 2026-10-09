import Link from "next/link";
import type { NavItem } from "@/config/navigation";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

interface SidebarNavLinkProps {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}

/** One menu entry: mint pill with a teal edge marker when it is the current section. */
export function SidebarNavLink({ item: { route, label, icon: Icon }, active, onNavigate }: SidebarNavLinkProps) {
  return (
    <Link
      href={route}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex items-center gap-3 rounded-lg px-3 py-2 text-label font-medium transition-colors duration-180",
        active ? "bg-selected font-semibold text-on-selected" : "text-fg-muted hover:bg-background hover:text-fg",
        focusRing,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1.5 -left-3 w-[3px] rounded-r-full bg-primary transition-[opacity,scale] duration-280 ease-standard",
          active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors duration-180",
          active ? "text-primary" : "text-fg-muted/80 group-hover/nav:text-fg",
        )}
      />
      <span className="leading-snug">{label}</span>
    </Link>
  );
}
