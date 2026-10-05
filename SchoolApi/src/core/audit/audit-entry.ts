export interface AuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  schoolId?: string | null;
  branchId?: string | null;
  before?: unknown;
  after?: unknown;
  /** Defaults to the authenticated user of the request. */
  actorId?: string;
  onBehalfOfStaffId?: string;
}
