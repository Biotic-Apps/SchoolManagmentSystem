import { cn } from "@/lib/cn";
import { EMPTY_VALUE, formatMoney } from "@/lib/format";

interface MoneyTextProps {
  amountMinor: number | null | undefined;
  currency?: string;
  className?: string;
}

export function MoneyText({ amountMinor, currency = "PKR", className }: MoneyTextProps) {
  const text = amountMinor === null || amountMinor === undefined ? EMPTY_VALUE : formatMoney(amountMinor, currency);
  return <span className={cn("tabular-nums", className)}>{text}</span>;
}
