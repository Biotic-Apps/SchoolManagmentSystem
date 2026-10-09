import type { SkillDomain } from '../../../generated/prisma/client';

export interface SkillItemSeed {
  domain: SkillDomain;
  name: string;
}

export interface SkillLevelSeed {
  value: number;
  code: string;
  label: string;
}

/** Same defaults as migration 20261009150000_behaviour_skills. */
export const DEFAULT_SKILL_ITEMS: SkillItemSeed[] = [
  ...[
    'Punctuality',
    'Neatness',
    'Behaviour',
    'Attentiveness',
    'Politeness',
    'Cooperation with others',
    'Honesty',
    'Self-control',
  ].map((name) => ({ domain: 'AFFECTIVE' as const, name })),
  ...[
    'Handwriting',
    'Sports & games',
    'Drawing & painting',
    'Crafts',
    'Verbal fluency',
    'Musical skills',
  ].map((name) => ({ domain: 'PSYCHOMOTOR' as const, name })),
];

export const DEFAULT_SKILL_SCALE: SkillLevelSeed[] = [
  { value: 5, code: 'A', label: 'Excellent' },
  { value: 4, code: 'B', label: 'Very good' },
  { value: 3, code: 'C', label: 'Good' },
  { value: 2, code: 'D', label: 'Fair' },
  { value: 1, code: 'E', label: 'Needs improvement' },
];

export const SKILL_DOMAIN_LABEL: Record<SkillDomain, string> = {
  AFFECTIVE: 'Affective (behaviour)',
  PSYCHOMOTOR: 'Psychomotor (skills)',
};
