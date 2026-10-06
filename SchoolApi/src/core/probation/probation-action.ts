import type { Prisma } from '../../generated/prisma/client';

/** A change that a probation teacher's reviewer must approve before it applies. */
export interface ReviewableAction<P = unknown> {
  /** Key of the registered ProbationActionHandler. */
  key: string;
  entityType: string;
  entityId: string;
  schoolId: string;
  branchId: string | null;
  title: string;
  payload: P;
}

export interface ApplyContext {
  /** Who the change is recorded as performed by. */
  performedById: string;
  /** Staff the work is done for (probation teacher or proxied teacher). */
  onBehalfOfStaffId: string | null;
}

/** Stored as the PROBATION_REVIEW approval payload. */
export interface HeldAction<P = unknown> {
  action: string;
  payload: P;
  staffId: string;
  onBehalfOfStaffId: string | null;
}

/** Registered per reviewable action; replays the held change on approval. */
export interface ProbationActionHandler<P = unknown> {
  readonly key: string;
  apply(
    payload: P,
    context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
  /** Marks the record as awaiting review (e.g. `pendingApprovalId`). */
  onHeld?(
    payload: P,
    approvalId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
  /** Clears the pending marker when the reviewer rejects or returns. */
  onDiscarded?(payload: P, tx: Prisma.TransactionClient): Promise<void>;
}

export type GateResult<T> =
  | { status: 'APPLIED'; approvalId: null; result: T }
  | { status: 'PENDING_REVIEW'; approvalId: string; result: null };
