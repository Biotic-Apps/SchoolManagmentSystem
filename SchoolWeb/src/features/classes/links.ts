import type { ClassIssue } from "./setup-types";

export type SetupCard = "sections" | "subjects" | "teachers";

function withQuery(path: string, query: Record<string, string | null | undefined>, hash?: string): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

/** Class setup screen, optionally scrolled to one of its cards. */
export const classSetupHref = (classId: string, branchId: string | null, sessionId: string | null, card?: SetupCard) =>
  withQuery(`/classes/${classId}`, { branchId, sessionId }, card);

/** Timetable builder with a section already picked. */
export const timetableHref = (branchId: string | null, sectionId?: string | null) =>
  withQuery("/timetable", { branchId, sectionId });

export const ISSUE_COPY: Record<ClassIssue, { label: string; card: SetupCard | "timetable" }> = {
  NO_SECTIONS: { label: "No sections yet", card: "sections" },
  NO_SUBJECTS: { label: "No subjects yet", card: "subjects" },
  NO_CLASS_TEACHER: { label: "No class teacher", card: "sections" },
  SUBJECTS_WITHOUT_TEACHER: { label: "Subjects without a teacher", card: "teachers" },
  NO_TIMETABLE: { label: "No timetable", card: "timetable" },
};
