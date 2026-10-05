export type AuditEntityType = "School" | "Branch" | "User" | string;

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: { id: string; name: string } | null;
  onBehalfOf: { id: string; name: string } | string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  at: string;
}
