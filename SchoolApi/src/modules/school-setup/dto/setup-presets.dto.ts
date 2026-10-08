export class PresetSectionDto {
  name!: string;
  group!: string | null;
}

export class PresetSubjectDto {
  code!: string;
  name!: string;
  periodsPerWeek!: number | null;
  group!: string | null;
  isOptional!: boolean;
}

export class LevelPresetDto {
  key!: string;
  label!: string;
  classNames!: string[];
  /** Default sections of each class (Matric: A Science, B Arts). */
  sections!: PresetSectionDto[];
  subjects!: PresetSubjectDto[];
}

export class BellFridayDto {
  periodMinutes!: number;
  periodsPerDay!: number;
  breakMinutes!: number;
}

export class BellDefaultsDto {
  startTime!: string;
  periodMinutes!: number;
  periodsPerDay!: number;
  breakAfter!: number;
  breakMinutes!: number;
  friday!: BellFridayDto;
}

export class SetupPresetsDto {
  levels!: LevelPresetDto[];
  bellSchedule!: BellDefaultsDto;
}
