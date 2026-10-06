"use client";

import { Banknote, Send } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { minor } from "../amounts";
import type { Expense } from "../types";
import { useExpenseDetail } from "../use-expense-detail";
import type { ExpenseLookups } from "../use-expense-lookups";
import { ExpensePayments } from "./ExpensePayments";
import { ExpenseSummary } from "./ExpenseSummary";
import { PaymentDialog } from "./PaymentDialog";

interface ExpenseDetailDrawerProps {
  expense: Expense | null;
  lookups: ExpenseLookups;
  onClose: () => void;
}

export function ExpenseDetailDrawer({ expense, lookups, onClose }: ExpenseDetailDrawerProps) {
  const detail = useExpenseDetail(expense);

  return (
    <DetailDrawer
      open={!!expense}
      onOpenChange={(next) => {
        if (next) return;
        detail.payment.close();
        onClose();
      }}
      title={expense?.title ?? "Expense"}
      description={
        expense && (
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={expense.status} />
            <MoneyText amountMinor={minor(expense.amountMinor)} className="font-medium text-fg" />
          </span>
        )
      }
      actions={
        expense && (
          <>
            {detail.rights.submit && (
              <Button size="sm" loading={detail.submitting} onClick={detail.submitForApproval}>
                <Send />
                Submit for approval
              </Button>
            )}
            {detail.rights.pay && (
              <Button size="sm" onClick={() => detail.payment.show(true)}>
                <Banknote />
                Record payment
              </Button>
            )}
            {detail.hasBill && <DownloadButton url={detail.billUrl} label="Bill copy" size="sm" />}
          </>
        )
      }
    >
      {expense && (
        <>
          <ExpenseSummary expense={expense} lookups={lookups} />
          <section className="flex flex-col gap-3">
            <SectionHeading title="Payments" />
            <ExpensePayments payments={expense.payments ?? []} />
          </section>
          {detail.payment.open && (
            <PaymentDialog expenseId={expense.id} balanceMinor={detail.balance} onClose={detail.payment.close} />
          )}
        </>
      )}
    </DetailDrawer>
  );
}
