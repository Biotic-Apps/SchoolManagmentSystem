import type { ReactNode } from "react";

/** Re-mounts on every navigation, so each page's content eases in (a plain fade under reduced motion). */
export default function PortalTemplate({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 w-full flex-1 animate-page-in flex-col gap-6">{children}</div>;
}
