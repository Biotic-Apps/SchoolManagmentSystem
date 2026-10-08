/** academics-timetable-contract §5.1 level presets (editable starting points; boards differ). */
export const LEVELS = [
  'EARLY',
  'PRIMARY',
  'MIDDLE',
  'MATRIC',
  'CUSTOM',
] as const;
export type Level = (typeof LEVELS)[number];

export interface PresetSubject {
  code: string;
  name: string;
  periodsPerWeek: number | null;
  group?: string;
  isOptional?: boolean;
}

export interface LevelPreset {
  key: Exclude<Level, 'CUSTOM'>;
  label: string;
  classNames: string[];
  subjects: PresetSubject[];
  /** Default sections of each class of the level. */
  sections: { name: string; group?: string }[];
}

const s = (
  code: string,
  name: string,
  periodsPerWeek: number | null,
  extra: Partial<PresetSubject> = {},
): PresetSubject => ({ code, name, periodsPerWeek, ...extra });

export const LEVEL_PRESETS: readonly LevelPreset[] = [
  {
    key: 'EARLY',
    label: 'Early years',
    classNames: ['Playgroup', 'Nursery', 'Prep'],
    sections: [{ name: 'A' }],
    subjects: [
      s('ENG', 'English', 6),
      s('URDU', 'Urdu', 6),
      s('MATH', 'Mathematics', 6),
      s('QURAN', 'Nazra Quran', 4),
      s('GK', 'General Knowledge', 3),
      s('ART', 'Art & Drawing', 3),
    ],
  },
  {
    key: 'PRIMARY',
    label: 'Primary',
    classNames: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    sections: [{ name: 'A' }],
    subjects: [
      s('ENG', 'English', 6),
      s('URDU', 'Urdu', 6),
      s('MATH', 'Mathematics', 6),
      s('SCI', 'General Science', 4),
      s('ISL', 'Islamiat', 3),
      s('SST', 'Social Studies', 3),
      s('QURAN', 'Nazra Quran', 3),
      s('CS', 'Computer Science', 2),
    ],
  },
  {
    key: 'MIDDLE',
    label: 'Middle',
    classNames: ['Class 6', 'Class 7', 'Class 8'],
    sections: [{ name: 'A' }],
    subjects: [
      s('ENG', 'English', 6),
      s('URDU', 'Urdu', 6),
      s('MATH', 'Mathematics', 6),
      s('SCI', 'General Science', 6),
      s('ISL', 'Islamiat', 3),
      s('SST', 'Social Studies', 4),
      s('CS', 'Computer Science', 3),
      s('TQ', 'Tarjuma-tul-Quran', 2),
    ],
  },
  {
    key: 'MATRIC',
    label: 'Matric',
    classNames: ['Class 9', 'Class 10'],
    sections: [
      { name: 'A', group: 'Science' },
      { name: 'B', group: 'Arts' },
    ],
    subjects: [
      s('ENG', 'English', 6),
      s('URDU', 'Urdu', 5),
      s('MATH', 'Mathematics', 6),
      s('ISL', 'Islamiat', 3),
      s('PST', 'Pakistan Studies', 3),
      s('TQ', 'Tarjuma-tul-Quran', 2),
      s('PHY', 'Physics', 6, { group: 'Science' }),
      s('CHEM', 'Chemistry', 6, { group: 'Science' }),
      s('BIO', 'Biology', 6, { group: 'Science' }),
      s('CS', 'Computer Science', null, {
        group: 'Science',
        isOptional: true,
      }),
      s('SCI', 'General Science', 6, { group: 'Arts' }),
      s('CIV', 'Civics', 6, { group: 'Arts' }),
      s('ECO', 'Economics', 6, { group: 'Arts' }),
    ],
  },
];

/** Preset of a class name (legacy STANDARD classes), used for periods/week defaults. */
export function presetOfClass(name: string): LevelPreset | undefined {
  return LEVEL_PRESETS.find((l) => l.classNames.includes(name));
}
