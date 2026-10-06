import { MoneyText } from "@/components/shared/MoneyText";
import { StatCard } from "@/components/shared/StatCard";

interface RunTotalsProps {
  totals: { net: number; paid: number; balance: number };
  staffCount: number;
}

export function RunTotals({ totals, staffCount }: RunTotalsProps) {
  const hint = `${staffCount} staff ${staffCount === 1 ? "member" : "members"}`;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Net payable" value={<MoneyText amountMinor={totals.net} />} hint={hint} />
      <StatCard label="Paid" value={<MoneyText amountMinor={totals.paid} />} />
      <StatCard label="Balance" value={<MoneyText amountMinor={totals.balance} />} />
    </div>
  );
}
