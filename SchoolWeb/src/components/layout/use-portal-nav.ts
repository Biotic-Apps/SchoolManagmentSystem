import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { useSession } from "@/features/auth/session-context";
import { menuFor } from "@/lib/permissions";

function activeIdFor(pathname: string, items: NavItem[]): string | null {
  const match = items.find((entry) => pathname === entry.route || pathname.startsWith(`${entry.route}/`));
  return match?.id ?? null;
}

export function usePortalNav() {
  const { session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(() => menuFor(session), [session]);
  const activeId = activeIdFor(pathname, items);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  return { items, activeId, mobileOpen, setMobileOpen, openMobile, closeMobile };
}
