/** GET /dashboard/summary — counts; later phases add more keys. */
export interface DashboardSummary {
  schools?: number;
  branches?: number;
  users?: number;
  activeSessions?: number;
  sections?: number;
  pendingApprovals?: number;
  [key: string]: number | undefined;
}
