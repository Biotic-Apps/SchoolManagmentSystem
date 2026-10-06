export const progressKeys = {
  all: ["progress"] as const,
  notes: (studentId: string | null) => ["progress", "notes", studentId] as const,
  homework: (studentId: string | null, from: string, to: string) => ["progress", "homework", studentId, from, to] as const,
};
