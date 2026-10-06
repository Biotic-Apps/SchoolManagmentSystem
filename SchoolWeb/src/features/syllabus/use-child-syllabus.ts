import { useActiveChild } from "@/features/auth/use-active-child";
import { useStudent } from "@/features/students/api";
import { useBookLists, useSyllabusPlans } from "./api";
import { latestRevision } from "./options";
import type { SyllabusPlan } from "./types";

/** Latest approved plan per subject, in subject-name order. */
function approvedPerSubject(plans: SyllabusPlan[] | undefined): SyllabusPlan[] {
  const bySubject = new Map<string, SyllabusPlan>();
  for (const plan of plans ?? []) {
    if (plan.status !== "APPROVED") continue;
    const kept = bySubject.get(plan.subjectId);
    if (!kept || plan.revision > kept.revision) bySubject.set(plan.subjectId, plan);
  }
  return [...bySubject.values()].sort((a, b) => a.subjectName.localeCompare(b.subjectName));
}

/**
 * The parent's child has no classId, so the class book list is matched on className
 * within the child's branch and session (the API already limits parents to APPROVED lists).
 */
export function useChildSyllabus() {
  const child = useActiveChild();
  const student = useStudent(child?.id ?? null);
  const enrollment = student.data?.enrollment ?? null;

  const books = useBookLists(
    { branchId: enrollment?.branchId, sessionId: enrollment?.sessionId },
    !!enrollment,
  );
  const plans = useSyllabusPlans({ sectionId: enrollment?.sectionId, sessionId: enrollment?.sessionId }, !!enrollment);

  const bookList = latestRevision(
    books.data?.filter((list) => list.status === "APPROVED" && list.className === enrollment?.className),
  );

  return {
    caption: child ? [child.name, child.className, child.sectionName].filter(Boolean).join(" · ") : undefined,
    child,
    student,
    enrollment,
    books,
    bookList,
    plans,
    subjectPlans: approvedPerSubject(plans.data),
  };
}
