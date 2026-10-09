// Behaviour & skills (results contract §Skills).

export type SkillDomain = "AFFECTIVE" | "PSYCHOMOTOR";

export interface SkillItem {
  id: string;
  domain: SkillDomain;
  name: string;
  sortOrder: number;
}

export interface SkillScaleLevel {
  /** 1 = lowest. */
  value: number;
  code: string;
  label: string;
}

export interface SkillConfig {
  branchId: string;
  items: SkillItem[];
  /** Highest first. */
  scale: SkillScaleLevel[];
}

export interface SkillConfigInput {
  items: { id?: string; domain: SkillDomain; name: string }[];
  scale: SkillScaleLevel[];
}

export interface SkillStudentRow {
  studentId: string;
  name: string;
  rollNo: number | null;
  /** itemId → scale value */
  ratings: Record<string, number>;
}

export interface SkillGrid {
  examId: string;
  sectionId: string;
  editable: boolean;
  items: SkillItem[];
  scale: SkillScaleLevel[];
  students: SkillStudentRow[];
  complete: number;
}

export interface SkillRatingInput {
  studentId: string;
  itemId: string;
  value: number | null;
}

/** One rated item on a published result. */
export interface StudentSkill {
  domain: SkillDomain;
  name: string;
  value: number;
  code: string;
  label: string;
}

export const SKILL_DOMAINS: { id: SkillDomain; name: string; hint: string }[] = [
  { id: "AFFECTIVE", name: "Affective", hint: "Behaviour and attitudes" },
  { id: "PSYCHOMOTOR", name: "Psychomotor", hint: "Physical and creative skills" },
];
