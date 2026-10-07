"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import type { NavId } from "@/config/navigation";
import { useModuleAccess } from "../use-module-access";

interface ModuleGuardProps {
  moduleId: NavId;
  /** Detail pages opened from other screens only need the view permission, not a menu entry. */
  detail?: boolean;
  children: ReactNode;
}

/** Renders a built module only when it is in the active role's menu and the role holds its view permission. */
export function ModuleGuard({ moduleId, detail = false, children }: ModuleGuardProps) {
  const { label, allowed } = useModuleAccess(moduleId, { menuOnly: !detail });
  if (allowed) return children;
  return (
    <>
      <PageHeader title={label} />
      <Card>
        <EmptyState
          icon={Lock}
          title="You don't have access to this section"
          description="Ask your administrator if you need access."
        />
      </Card>
    </>
  );
}
