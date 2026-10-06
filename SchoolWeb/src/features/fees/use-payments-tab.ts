import { useMemo } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useCan } from "@/features/auth/use-can";
import { useStaffOptions } from "@/features/staff/api";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { paymentColumns } from "./payment-columns";
import { usePayments } from "./payments-api";
import type { Payment } from "./types";

export type PaymentFilters = { from?: string; to?: string; method?: string; cashierId?: string };

export function usePaymentsTab(branchId: string | null) {
  const can = useCan();
  const list = useListState<PaymentFilters>({});
  const query = usePayments({ ...list.params, branchId }, !!branchId);
  const staff = useStaffOptions(branchId);

  const record = useDialogState<null>();
  const receipt = useDialogState<Payment>();
  const refund = useDialogState<Payment>();
  const reverse = useDialogState<Payment>();

  const canAdd = can("fees.add");
  const canEdit = can("fees.edit");
  const columns = useMemo(
    () =>
      paymentColumns({
        onReceipt: receipt.show,
        onRefund: canAdd ? refund.show : undefined,
        onReverse: canEdit ? reverse.show : undefined,
      }),
    [canAdd, canEdit, receipt.show, refund.show, reverse.show],
  );

  // Cashiers are the staff who record payments, matched by their login.
  const cashierOptions: Option[] = staff.staff
    .filter((member) => !!member.userId)
    .map((member) => ({ id: member.userId as string, name: member.name }));

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    cashierOptions,
    canAdd,
    dialogs: { record, receipt, refund, reverse },
  };
}
