export const settingsKeys = {
  all: ["settings"] as const,
  school: (schoolId: string) => ["settings", "school", schoolId] as const,
  notifications: (schoolId: string) => ["settings", "notifications", schoolId] as const,
  policies: (schoolId: string) => ["settings", "policies", schoolId] as const,
  failedNotifications: (params: object) => ["settings", "support", "notifications", params] as const,
  jobs: (params: object) => ["settings", "support", "jobs", params] as const,
  health: ["settings", "support", "health"] as const,
  backups: ["settings", "backups"] as const,
  imports: (branchId: string | null) => ["settings", "imports", branchId] as const,
  importDetail: (id: string) => ["settings", "imports", "detail", id] as const,
};
