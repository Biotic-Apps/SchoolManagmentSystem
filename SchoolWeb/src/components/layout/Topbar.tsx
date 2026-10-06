"use client";

import { Menu } from "lucide-react";
import { ChildSwitcher } from "@/components/shared/ChildSwitcher";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/features/auth/session-context";
import { useSignOut } from "@/features/auth/use-sign-out";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { RoleSwitcher } from "./RoleSwitcher";
import { TopbarBrand } from "./TopbarBrand";
import { useTopbarBrandStyle } from "./use-topbar-brand-style";
import { UserMenu } from "./UserMenu";

interface TopbarProps {
  onOpenMenu: () => void;
}

export function Topbar({ onOpenMenu }: TopbarProps) {
  const { session, switchRole, activeChildId, selectChild } = useSession();
  const signOut = useSignOut();
  const brandStyle = useTopbarBrandStyle();
  if (!session) return null;

  return (
    <header
      style={brandStyle}
      className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu />
      </Button>
      <TopbarBrand />
      {session.activeRole === "PARENT" && (
        <ChildSwitcher items={session.children} value={activeChildId} onChange={selectChild} />
      )}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        <RoleSwitcher roles={session.roles} activeRole={session.activeRole} onChange={switchRole} />
        <UserMenu name={session.user.name} email={session.user.email} onSignOut={signOut} />
      </div>
    </header>
  );
}
