import { useStudents } from "@/features/students/api";

/** Active students of one section (a section fits in one page). */
export function useSectionStudents(sectionId: string | null) {
  const query = useStudents({ sectionId, page: 1, pageSize: 100, status: "ACTIVE" }, !!sectionId);
  return { query, students: query.data?.data ?? [] };
}
