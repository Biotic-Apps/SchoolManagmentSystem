import { DetailList } from "@/components/shared/DetailList";
import { MoneyText } from "@/components/shared/MoneyText";
import { formatDate, textOrDash } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { expenseBalance, expensePaid, isRecurring, recurringUntil } from "../amounts";
import type { Expense } from "../types";
import type { ExpenseLookups } from "../use-expense-lookups";

function recurringText(expense: Expense): string {
  if (!isRecurring(expense)) return "No";
  const until = recurringUntil(expense);
  return until ? `Monthly until ${formatPeriod(until)}` : "Monthly";
}

export function ExpenseSummary({ expense, lookups }: { expense: Expense; lookups: ExpenseLookups }) {
  return (
    <DetailList
      items={[
        { label: "Category", value: lookups.categoryName(expense) },
        { label: "Vendor", value: lookups.vendorName(expense) },
        { label: "Bill date", value: formatDate(expense.billDate) },
        { label: "Due date", value: formatDate(expense.dueDate) },
        { label: "Paid", value: <MoneyText amountMinor={expensePaid(expense)} /> },
        { label: "Balance", value: <MoneyText amountMinor={expenseBalance(expense)} className="font-medium" /> },
        { label: "Recurring", value: recurringText(expense) },
        { label: "Notes", value: textOrDash(expense.notes) },
      ]}
    />
  );
}
