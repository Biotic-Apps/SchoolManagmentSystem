"use client";

import { OptionSelect } from "@/components/shared/OptionSelect";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import type { PromotionsTabState } from "../../use-promotions-tab";

/** Branch, the session being closed and the session students move into. */
export function PromotionScopeBar({ tab }: { tab: PromotionsTabState }) {
  const { scope } = tab;
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <BranchPickerSelect picker={scope.picker} />
      <OptionSelect
        label="From session"
        options={scope.sessions.options}
        value={scope.sessionId}
        onChange={scope.setSessionId}
        className="md:w-56"
      />
      <span className="text-label text-fg-muted">to</span>
      <OptionSelect
        label="To session"
        options={tab.toSessionOptions}
        value={tab.toSessionId}
        onChange={tab.setToSessionId}
        className="md:w-56"
      />
    </div>
  );
}
