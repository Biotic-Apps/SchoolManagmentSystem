import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { todayIso } from "@/lib/dates";
import { cashierColumns, collectionPaymentColumns, refundColumns } from "./collection-columns";
import { useDailyCollection } from "./collections-api";

/** One day at the fee counter: totals per method and cashier, payments, and day closing. */
export function useCollectionDay(branchId: string | null) {
  const can = useCan();
  const [date, setDate] = useState(todayIso);
  const [closing, setClosing] = useState(false);
  const query = useDailyCollection(branchId, date);
  const day = query.data;

  const cashierCols = useMemo(() => cashierColumns(), []);
  const paymentCols = useMemo(() => collectionPaymentColumns(), []);
  const refundCols = useMemo(() => refundColumns(), []);
  const cashReceived = day?.byMethod?.find((row) => row.method === "CASH")?.amountMinor ?? 0;
  // Cash refunds paid out of the drawer come off (API expectedCashMinor).
  const expectedCashMinor = day?.expectedCashMinor ?? cashReceived - (day?.cashRefundedMinor ?? 0);

  return {
    date,
    setDate,
    query,
    day,
    closed: !!day?.closed,
    expectedCashMinor,
    cashierCols,
    paymentCols,
    refundCols,
    canClose: can("fees.approve") && !!branchId && !!day && !day.closed,
    closing,
    setClosing,
  };
}
