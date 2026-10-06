/** GET /dashboard/summary — counts; later phases add more keys. */
export interface DashboardSummary {
  schools?: number;
  branches?: number;
  users?: number;
  activeSessions?: number;
  sections?: number;
  pendingApprovals?: number;
  students?: number;
  staff?: number;
  pendingAdmissions?: number;
  pendingChildLinks?: number;
  [key: string]: number | undefined;
}
