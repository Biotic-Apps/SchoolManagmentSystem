/** school-setup-contract §1 presets (the principal can edit them later). */
export const CLASS_PRESETS = {
  STANDARD: [
    'Playgroup',
    'Nursery',
    'Prep',
    ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
  ],
  NONE: [],
} as const satisfies Record<string, readonly string[]>;

export const SUBJECT_PRESETS = {
  STANDARD: [
    { code: 'ENG', name: 'English' },
    { code: 'URDU', name: 'Urdu' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'SCI', name: 'General Science' },
    { code: 'ISL', name: 'Islamiat' },
    { code: 'SST', name: 'Social Studies' },
    { code: 'CS', name: 'Computer Science' },
    { code: 'QURAN', name: 'Nazra Quran' },
  ],
  NONE: [],
} as const satisfies Record<string, readonly { code: string; name: string }[]>;

/** Every name a partial selection may use (the STANDARD presets). */
export const PRESET_CLASS_NAMES: readonly string[] = CLASS_PRESETS.STANDARD;
export const PRESET_SUBJECT_NAMES: readonly string[] =
  SUBJECT_PRESETS.STANDARD.map((s) => s.name);

export type ClassesPreset = keyof typeof CLASS_PRESETS;
export type SubjectsPreset = keyof typeof SUBJECT_PRESETS;
export const PRESET_NAMES = ['STANDARD', 'NONE'] as const;

export const MAX_SECTIONS_PER_CLASS = 4;

/** 1 → ["A"], 2 → ["A", "B"] … */
export function sectionNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
}

export const SETUP_DEFAULTS = {
  branchName: 'Main Branch',
  branchCode: 'MAIN',
  timings: {
    opensAt: '08:00',
    closesAt: '14:00',
    attendanceLockAt: '10:00',
    staffArrivesAt: '07:30',
    staffLeavesAt: '14:00',
  },
  workingDays: [1, 2, 3, 4, 5, 6],
  classesPreset: 'STANDARD' as ClassesPreset,
  subjectsPreset: 'STANDARD' as SubjectsPreset,
  sectionsPerClass: 1,
} as const;
