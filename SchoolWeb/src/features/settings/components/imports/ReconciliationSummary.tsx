import type { ReactNode } from "react";
import { DetailList } from "@/components/shared/DetailList";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import type { ImportDetail } from "../../import-types";
import { reconciliationView } from "../../reconciliation";

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption text-fg-muted">{label}</span>
      <span className="text-right text-card-title font-semibold tabular-nums text-fg">{children}</span>
    </div>
  );
}

export function ReconciliationSummary({ detail }: { detail: ImportDetail }) {
  const view = reconciliationView(detail);
  const matched = view.totals && view.totals.fileTotal === view.totals.importedTotal;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <SectionHeading
        title="Reconciliation"
        actions={
          view.totals && <Badge tone={matched ? "success" : "error"}>{matched ? "Totals match" : "Totals differ"}</Badge>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Figure label="Rows created">{formatNumber(view.created)}</Figure>
        <Figure label="Rows skipped">{formatNumber(view.skipped)}</Figure>
        {view.totals && (
          <>
            <Figure label="File total">
              <MoneyText amountMinor={view.totals.fileTotal} />
            </Figure>
            <Figure label="Imported total">
              <MoneyText amountMinor={view.totals.importedTotal} />
            </Figure>
          </>
        )}
      </div>
      {view.extras.length > 0 && (
        <DetailList
          items={view.extras.map((extra) => ({
            label: extra.label,
            value: extra.money ? (
              <MoneyText amountMinor={Number(extra.value)} />
            ) : typeof extra.value === "number" ? (
              formatNumber(extra.value)
            ) : (
              typeof extra.value === "boolean" ? (extra.value ? "Yes" : "No") : String(extra.value)
            ),
          }))}
        />
      )}
    </Card>
  );
}
