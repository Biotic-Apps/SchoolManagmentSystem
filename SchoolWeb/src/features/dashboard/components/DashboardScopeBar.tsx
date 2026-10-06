"use client";

import { ScopePicker } from "@/components/shared/ScopePicker";
import { Button } from "@/components/ui/Button";
import type { useDashboardScope } from "../use-dashboard-scope";

export function DashboardScopeBar({ scope }: { scope: ReturnType<typeof useDashboardScope> }) {
  if (!scope.showPicker) return null;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ScopePicker
        value={scope.scope}
        onChange={scope.setScope}
        schools={scope.schools}
        branches={scope.branches}
        sessions={scope.sessions}
        hideSchool={scope.hideSchool}
      />
      {scope.isFiltered && (
        <Button variant="ghost" onClick={scope.reset}>
          Show everything
        </Button>
      )}
    </div>
  );
}
