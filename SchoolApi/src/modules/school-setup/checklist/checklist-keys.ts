export const CHECKLIST_KEYS = [
  'session',
  'classes',
  'subjects',
  'teachers',
  'students',
  'timetable',
  'feePlan',
] as const;

export type ChecklistKey = (typeof CHECKLIST_KEYS)[number];
