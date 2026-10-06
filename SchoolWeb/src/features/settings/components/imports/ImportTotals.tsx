import { StatCard } from "@/components/shared/StatCard";
import { formatNumber } from "@/lib/format";
import type { ImportTotals as Totals } from "../../import-types";

function NumberValue({ value }: { value: number }) {
  return <span className="block text-right tabular-nums">{formatNumber(value)}</span>;
}

export function ImportTotals({ totals }: { totals: Totals }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard label="Rows" value={<NumberValue value={totals.rows} />} />
      <StatCard label="Valid" value={<NumberValue value={totals.valid} />} />
      <StatCard label="Invalid" value={<NumberValue value={totals.invalid} />} />
    </div>
  );
}
