import { useSession } from "@/features/auth/session-context";

/** School of the active role's first assignment (null for global roles). */
export function useSessionSchoolId(): string | null {
  const { session } = useSession();
  if (!session) return null;
  const assignment = session.assignments.find((item) => item.role === session.activeRole && item.schoolId);
  return assignment?.schoolId ?? null;
}
