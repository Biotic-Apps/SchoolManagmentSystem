"use client";

import type { ReactNode } from "react";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { usePortalNav } from "./use-portal-nav";

export function PortalShell({ children }: { children: ReactNode }) {
  const { items, activeId, mobileOpen, setMobileOpen, openMobile } = usePortalNav();

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar items={items} activeId={activeId} />
      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} items={items} activeId={activeId} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={openMobile} />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
