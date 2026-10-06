"use client";

import { CalendarCheck, Send, Sparkles } from "lucide-react";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/Button";
import { DECISION_OPTIONS } from "../../promotion-options";
import type { PromotionsTabState } from "../../use-promotions-tab";

/** Class / decision filters and the Suggest, Confirm for approval and Apply actions. */
export function PromotionToolbar({ tab }: { tab: PromotionsTabState }) {
  const { scope, dialogs } = tab;
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <FilterBar>
        <FilterSelect
          label="Class"
          allLabel="All classes"
          options={scope.classes.options}
          value={scope.classId}
          onChange={scope.setClassId}
        />
        <FilterSelect
          label="Decision"
          options={DECISION_OPTIONS}
          value={tab.decision}
          onChange={tab.setDecision}
        />
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {tab.canSuggest && (
          <Button variant="secondary" onClick={() => dialogs.suggest.show()}>
            <Sparkles />
            Suggest
          </Button>
        )}
        {tab.isManager && (
          <Button variant="secondary" onClick={() => dialogs.confirm.show()} disabled={!tab.canConfirm}>
            <Send />
            Confirm for approval
          </Button>
        )}
        {tab.isManager && (
          <Button
            onClick={() => dialogs.apply.show()}
            disabled={!tab.canApply}
            title={tab.canApply ? undefined : "Available once promotions are confirmed and approved"}
          >
            <CalendarCheck />
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}
