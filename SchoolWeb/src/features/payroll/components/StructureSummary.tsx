import { formatPeriod } from "@/lib/period";
import { structureTotals } from "../normalize";
import type { SalaryStructure } from "../types";
import { AmountList, type AmountRow } from "./AmountList";

const itemRows = (items: SalaryStructure["allowances"]): AmountRow[] =>
  (items ?? []).map((item) => ({ label: item.name, amountMinor: item.amountMinor }));

/** Current structure with gross and net worked out for display (the API calculates payroll). */
export function StructureSummary({ structure }: { structure: SalaryStructure }) {
  const totals = structureTotals(structure);
  return (
    <div className="flex flex-col gap-5">
      <p className="text-label text-fg-muted">Effective from {formatPeriod(structure.effectiveFrom)}</p>
      <AmountList
        title="Earnings"
        rows={[
          { label: "Basic salary", amountMinor: structure.basicMinor },
          ...itemRows(structure.allowances),
          { label: "Gross salary", amountMinor: totals.gross, total: true },
        ]}
      />
      <AmountList
        title="Deductions"
        rows={[...itemRows(structure.deductions), { label: "Total deductions", amountMinor: totals.deductions, total: true }]}
      />
      <AmountList rows={[{ label: "Net salary", amountMinor: totals.net, total: true }]} />
    </div>
  );
}
