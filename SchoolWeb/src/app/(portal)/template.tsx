"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The only page-entrance animation in the portal: the main content fades up once per pathname.
 * Next keys a template by its own segment only, so deeper moves (/students -> /students/12) would not
 * replay it; keying on the pathname covers those, while search-param changes and data refetches
 * leave the key alone. Topbar and sidebar live in the layout above, so they never re-animate.
 */
export default function PortalTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="flex min-h-0 w-full flex-1 animate-page-in flex-col gap-6">
      {children}
    </div>
  );
}
