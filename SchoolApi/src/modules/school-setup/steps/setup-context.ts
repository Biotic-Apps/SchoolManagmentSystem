import type { Prisma } from '../../../generated/prisma/client';
import type { AuditEntry } from '../../../core/audit/audit-entry';

/** Shared by every setup step: one transaction, one actor, audit staged after commit. */
export interface SetupContext {
  tx: Prisma.TransactionClient;
  actorId: string;
  audit: AuditEntry[];
}

export interface PlacedBranch {
  id: string;
  schoolId: string;
}
