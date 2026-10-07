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
  const isParent = session.activeRole === "PARENT";

  return (
    <header
      style={brandStyle}
      className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu />
      </Button>
      {/* On phones a parent's bar has room for the child switcher, not the school logo. */}
      <TopbarBrand hideOnMobile={isParent} />
      {isParent && (
        <ChildSwitcher
          items={session.children}
          value={activeChildId}
          onChange={selectChild}
          className="w-auto min-w-0 flex-1 sm:w-72 sm:flex-none"
        />
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationBell />
        <RoleSwitcher roles={session.roles} activeRole={session.activeRole} onChange={switchRole} />
        <UserMenu name={session.user.name} email={session.user.email} onSignOut={signOut} />
      </div>
    </header>
  );
}
