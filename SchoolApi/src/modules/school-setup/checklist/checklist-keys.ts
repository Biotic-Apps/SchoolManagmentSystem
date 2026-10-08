export const CHECKLIST_KEYS = [
  'session',
  'classes',
  'subjects',
  'bellSchedule',
  'teachers',
  'allocation',
  'students',
  'timetable',
  'feePlan',
] as const;

export type ChecklistKey = (typeof CHECKLIST_KEYS)[number];
