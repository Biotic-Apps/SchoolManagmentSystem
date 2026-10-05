"use client";

import { Lock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import type { NavId } from "@/config/navigation";
import { useModuleAccess } from "../use-module-access";

export function ModuleComingSoon({ moduleId }: { moduleId: NavId }) {
  const { label, icon, phase, allowed } = useModuleAccess(moduleId);

  return (
    <>
      <PageHeader title={label} />
      <Card>
        {allowed ? (
          <EmptyState
            icon={icon}
            title={`${label} is coming in Phase ${phase}`}
            description="This module is planned and will be available here once it is built and tested."
          />
        ) : (
          <EmptyState
            icon={Lock}
            title="You don't have access to this section"
            description="Ask your administrator if you need access."
          />
        )}
      </Card>
    </>
  );
}
