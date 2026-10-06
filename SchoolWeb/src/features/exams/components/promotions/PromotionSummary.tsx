import { Badge } from "@/components/ui/Badge";
import { statusTone } from "@/lib/status-tone";
import { DECISION_LABEL, DECISIONS } from "../../promotion-options";
import type { PromotionsTabState } from "../../use-promotions-tab";

/** Count of students per decision, plus how many are confirmed. */
export function PromotionSummary({ tab }: { tab: PromotionsTabState }) {
  const { counts } = tab;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Promotion totals">
      {DECISIONS.map((decision) => (
        <Badge key={decision} tone={statusTone(decision)} className="px-3 py-1 text-label">
          {DECISION_LABEL[decision]} <span className="font-semibold tabular-nums">{counts.byDecision[decision]}</span>
        </Badge>
      ))}
      <Badge tone="neutral" className="px-3 py-1 text-label">
        Confirmed <span className="font-semibold tabular-nums">{counts.confirmed}</span>
      </Badge>
    </div>
  );
}
