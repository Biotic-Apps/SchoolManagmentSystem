"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, MinusCircle } from "lucide-react";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { http } from "@/lib/http";
import { todayIso } from "@/lib/dates";
import { accountKeys } from "../keys";

function firstDayOfMonth(): string {
  const today = todayIso();
  return today.slice(0, 8) + "01";
}

interface ProfitLossLine {
  section: string;
  item: string;
  amountMinor: number;
}

interface ProfitLossData {
  totalIncomeMinor: number;
  totalExpensesMinor: number;
  netMinor: number;
  lines: ProfitLossLine[];
}

export function ProfitLossTab({ branchId }: { branchId: string }) {
  const [from, setFrom] = useState(firstDayOfMonth);
  const [to, setTo] = useState(todayIso);

  const params = { branchId, from, to };
  const query = useQuery({
    queryKey: accountKeys.profitLoss(params),
    queryFn: async () => (await http.get<ProfitLossData>("/profit-loss", params)).data,
    enabled: !!branchId && !!from && !!to,
  });

  const data = query.data;
  const incomeMinor = data?.totalIncomeMinor ?? 0;
  const expenseMinor = data?.totalExpensesMinor ?? 0;
  const netMinor = data?.netMinor ?? 0;

  const incomeRows = (data?.lines ?? []).filter((r) => r.section === "INCOME");
  const expenseRows = (data?.lines ?? []).filter((r) => r.section === "EXPENSE");

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Profit & Loss" />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded border px-2 py-1.5 text-sm bg-surface" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded border px-2 py-1.5 text-sm bg-surface" />
        </label>
      </div>

      {query.isLoading && <p className="text-sm text-muted">Loading report...</p>}
      {query.error && <p className="text-sm text-destructive">Failed to load report.</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Total Income" amount={incomeMinor} icon={<ArrowUpRight className="h-5 w-5 text-emerald-600" />} />
            <SummaryCard label="Total Expenses" amount={expenseMinor} icon={<ArrowDownRight className="h-5 w-5 text-red-500" />} />
            <SummaryCard label="Net Profit / (Loss)" amount={netMinor} icon={<MinusCircle className="h-5 w-5 text-blue-500" />} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Income</h3>
              <table className="w-full text-sm">
                <tbody>
                  {incomeRows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{row.item}</td>
                      <td className="py-2 text-right tabular-nums"><MoneyText amountMinor={row.amountMinor} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="pt-2">Total</td>
                    <td className="pt-2 text-right tabular-nums"><MoneyText amountMinor={incomeMinor} /></td>
                  </tr>
                </tfoot>
              </table>
            </Card>
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Expenses</h3>
              <table className="w-full text-sm">
                <tbody>
                  {expenseRows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{row.item}</td>
                      <td className="py-2 text-right tabular-nums"><MoneyText amountMinor={row.amountMinor} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="pt-2">Total</td>
                    <td className="pt-2 text-right tabular-nums"><MoneyText amountMinor={expenseMinor} /></td>
                  </tr>
                </tfoot>
              </table>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, amount, icon }: { label: string; amount: number; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      {icon}
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-lg font-semibold tabular-nums"><MoneyText amountMinor={amount} /></p>
      </div>
    </Card>
  );
}
