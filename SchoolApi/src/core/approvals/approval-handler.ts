import type {
  ApprovalRequest,
  ApprovalType,
  Prisma,
} from '../../generated/prisma/client';

/** Registered by each module that owns an approval type. Runs in the decide transaction. */
export interface ApprovalHandler {
  readonly type: ApprovalType;
  onApproved(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
  onRejected(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
  onReturned?(
    request: ApprovalRequest,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
}
