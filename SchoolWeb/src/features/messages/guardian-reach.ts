import type { StudentDetail } from "@/features/students/types";

export type GuardianReach = "ok" | "no-guardian" | "no-sign-in" | "not-approved";

/** Mirrors the API: a thread needs a VERIFIED guardian link whose guardian has a parent sign-in. */
export function guardianReach(student: StudentDetail): GuardianReach {
  const links = student.guardians.filter((l) => l.status === "VERIFIED" || l.status === "REQUESTED");
  if (links.some((l) => l.status === "VERIFIED" && l.guardian.hasAccount)) return "ok";
  if (links.length === 0) return "no-guardian";
  if (links.some((l) => l.status === "VERIFIED")) return "no-sign-in";
  return "not-approved";
}

/** Why the guardians of this student can't get a message, and what to do. */
export function guardianReachMessage(reach: Exclude<GuardianReach, "ok">, student: StudentDetail): string {
  const first = student.firstName || student.name;
  const where = `Students → ${student.name} → Guardians`;
  switch (reach) {
    case "no-guardian":
      return `${first} has no parent or guardian on record, so there is no one to message. Ask the office to add one from ${where}.`;
    case "no-sign-in":
      return `${first}'s guardian can't receive app messages yet: no parent sign-in. Ask the office to give the parent sign-in access from ${where}.`;
    case "not-approved":
      return `${first}'s guardian can't receive app messages yet: their link to ${first} is waiting for approval. Ask the office to approve it in Parents & Guardians → Link requests.`;
  }
}
