import type { Expense } from "./types";

/** Amounts may arrive as numeric strings (BigInt columns); null stays null. */
export function minor(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function expensePaid(expense: Expense): number {
  const paid = minor(expense.paidMinor);
  if (paid !== null) return paid;
  return (expense.payments ?? []).reduce((sum, payment) => sum + (minor(payment.amountMinor) ?? 0), 0);
}

export function expenseBalance(expense: Expense): number {
  const balance = minor(expense.balanceMinor);
  if (balance !== null) return balance;
  return Math.max(0, (minor(expense.amountMinor) ?? 0) - expensePaid(expense));
}

export function isRecurring(expense: Expense): boolean {
  return !!(expense.recurring?.monthly ?? expense.recurringMonthly);
}

export function recurringUntil(expense: Expense): string | null {
  return expense.recurring?.untilMonth ?? expense.recurringUntil ?? null;
}
