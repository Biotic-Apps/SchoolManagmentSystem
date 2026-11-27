import { useSession } from "@/features/auth/session-context";
import type { ScopeType } from "@/features/auth/types";

/** Scopes the API accepts for managing exams of a branch (assertManageBranch). */
const MANAGER_SCOPES = new Set<ScopeType>(["GLOBAL", "SCHOOL", "BRANCH"]);

/**
 * True when the active role can create/edit exams, schedules and grading schemes.
 * Teachers hold exams.add/edit for their own mark sheets, but their section/subject
 * scope is refused by the API ("Outside your scope"), so those buttons stay hidden.
 */
export function useIsExamManager(): boolean {
  const { session } = useSession();
  if (!session) return false;
  return session.assignments.some(
    (assignment) => assignment.role === session.activeRole && MANAGER_SCOPES.has(assignment.scopeType),
  );
}
