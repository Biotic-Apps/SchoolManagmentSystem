/**
 * Only advance (unallocated) money of a payment can be refunded; money that
 * settled invoices needs a reversal first. Pending refunds of the same
 * payment are already promised and count against it.
 */
export function refundableMinor(
  unallocatedMinor: bigint,
  pendingRefundsMinor: bigint,
): bigint {
  const left = unallocatedMinor - pendingRefundsMinor;
  return left > 0n ? left : 0n;
}

export function canRefund(
  amountMinor: bigint,
  unallocatedMinor: bigint,
  pendingRefundsMinor: bigint,
): boolean {
  return (
    amountMinor > 0n &&
    amountMinor <= refundableMinor(unallocatedMinor, pendingRefundsMinor)
  );
}
