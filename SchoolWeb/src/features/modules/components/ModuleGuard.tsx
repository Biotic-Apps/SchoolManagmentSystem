"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import type { NavId } from "@/config/navigation";
import { useModuleAccess } from "../use-module-access";

/** Renders a built module only when the active role holds its view permission. */
export function ModuleGuard({ moduleId, children }: { moduleId: NavId; children: ReactNode }) {
  const { label, allowed } = useModuleAccess(moduleId);
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
