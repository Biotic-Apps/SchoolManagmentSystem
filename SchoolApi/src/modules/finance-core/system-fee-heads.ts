import type { FeeHead, Prisma } from '../../generated/prisma/client';

/** Fee heads the system bills on its own (activity fees, store sales). */
export const SYSTEM_FEE_HEADS = {
  ACTIVITY: { code: 'ACTIVITY', name: 'Activity / Trip', kind: 'ONE_TIME' },
  STORE: { code: 'STORE', name: 'Store Sales', kind: 'ONE_TIME' },
} as const;

export type SystemFeeHeadKey = keyof typeof SYSTEM_FEE_HEADS;

/** Finds or creates the school's system fee head (`system = true`). */
export function systemFeeHead(
  tx: Prisma.TransactionClient,
  schoolId: string,
  key: SystemFeeHeadKey,
): Promise<FeeHead> {
  const head = SYSTEM_FEE_HEADS[key];
  return tx.feeHead.upsert({
    where: { schoolId_code: { schoolId, code: head.code } },
    create: {
      schoolId,
      code: head.code,
      name: head.name,
      kind: head.kind,
      refundable: false,
      system: true,
    },
    update: {},
  });
}
