/** Starting points per school level (contract §5.1); boards differ, so everything stays editable. */
export type ClassLevel = "EARLY" | "PRIMARY" | "MIDDLE" | "MATRIC" | "CUSTOM";

export interface PresetSubject {
  name: string;
  periodsPerWeek: number;
  group?: string;
  isOptional?: boolean;
}

export interface LevelPreset {
  key: Exclude<ClassLevel, "CUSTOM">;
  label: string;
  classNames: string[];
  subjects: PresetSubject[];
}

const s = (name: string, periodsPerWeek: number, extra: Partial<PresetSubject> = {}): PresetSubject => ({
  name,
  periodsPerWeek,
  ...extra,
});

export const LEVEL_PRESETS: LevelPreset[] = [
  {
    key: "EARLY",
    label: "Early years",
    classNames: ["Playgroup", "Nursery", "Prep"],
    subjects: [s("English", 6), s("Urdu", 6), s("Mathematics", 6), s("Nazra Quran", 4), s("General Knowledge", 3), s("Art & Drawing", 3)],
  },
  {
    key: "PRIMARY",
    label: "Primary",
    classNames: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
    subjects: [
      s("English", 6),
      s("Urdu", 6),
      s("Mathematics", 6),
      s("General Science", 4),
      s("Islamiat", 3),
      s("Social Studies", 3),
      s("Nazra Quran", 3),
      s("Computer Science", 2),
    ],
  },
  {
    key: "MIDDLE",
    label: "Middle",
    classNames: ["Class 6", "Class 7", "Class 8"],
    subjects: [
      s("English", 6),
      s("Urdu", 6),
      s("Mathematics", 6),
      s("General Science", 6),
      s("Islamiat", 3),
      s("Social Studies", 4),
      s("Computer Science", 3),
      s("Tarjuma-tul-Quran", 2),
    ],
  },
  {
    key: "MATRIC",
    label: "Matric",
    classNames: ["Class 9", "Class 10"],
    subjects: [
      s("English", 6),
      s("Urdu", 5),
      s("Mathematics", 6),
      s("Islamiat", 3),
      s("Pakistan Studies", 3),
      s("Tarjuma-tul-Quran", 2),
      s("Physics", 6, { group: "Science" }),
      s("Chemistry", 6, { group: "Science" }),
      s("Biology", 6, { group: "Science" }),
      s("Computer Science", 6, { group: "Science", isOptional: true }),
      s("General Science", 6, { group: "Arts" }),
      s("Civics", 6, { group: "Arts" }),
      s("Economics", 6, { group: "Arts" }),
    ],
  },
];

export const LEVEL_OPTIONS = [
  ...LEVEL_PRESETS.map((preset) => ({ id: preset.key, name: preset.label })),
  { id: "CUSTOM", name: "Other" },
];

export const MATRIC_GROUPS = ["Science", "Arts"];

export const presetFor = (level: ClassLevel) => LEVEL_PRESETS.find((preset) => preset.key === level) ?? null;

/** Level of a standard class name ("Class 9" → MATRIC); custom names are CUSTOM. */
export function levelOfClass(name: string): ClassLevel {
  const preset = LEVEL_PRESETS.find((item) => item.classNames.some((className) => className.toLowerCase() === name.trim().toLowerCase()));
  return preset?.key ?? "CUSTOM";
}

/** Every preset subject name once, in first-seen order (the wizard's matrix columns). */
export const ALL_PRESET_SUBJECTS = [...new Set(LEVEL_PRESETS.flatMap((preset) => preset.subjects.map((item) => item.name)))];
