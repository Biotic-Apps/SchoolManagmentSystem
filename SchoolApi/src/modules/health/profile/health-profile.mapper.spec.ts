import {
  EMPTY_PROFILE,
  mergeProfile,
  pickChanges,
  seesCareOnly,
  toCareView,
  toProfileColumns,
} from './health-profile.mapper';

const PROFILE = {
  ...EMPTY_PROFILE,
  bloodGroup: 'B+',
  allergies: [
    { name: 'Peanuts', severity: 'SEVERE' as const, reaction: 'Swelling' },
  ],
  conditions: ['Asthma'],
  instructions: 'Inhaler in bag',
  doctor: { name: 'Dr. Ali', phone: '+923001234567' },
  updatedAt: '2026-10-01T00:00:00.000Z',
};

describe('health profile mapper', () => {
  it('limits teachers and helpers to the care view; management sees all', () => {
    expect(seesCareOnly('TEACHER')).toBe(true);
    expect(seesCareOnly('HELPER')).toBe(true);
    for (const role of ['PRINCIPAL', 'COORDINATOR', 'HEAD_TEACHER', 'PARENT']) {
      expect(seesCareOnly(role)).toBe(false);
    }
  });

  it('keeps only allergies and instructions in the care view', () => {
    const view = toCareView({
      ...PROFILE,
      medications: [{ name: 'Ventolin', dose: '2 puffs', schedule: null }],
      emergencyContacts: [
        {
          name: 'Uncle',
          relation: 'Uncle',
          phone: '+923001112223',
          priority: 1,
        },
      ],
    });
    expect(view.allergies).toEqual(PROFILE.allergies);
    expect(view.instructions).toBe('Inhaler in bag');
    expect(view.bloodGroup).toBeNull();
    expect(view.conditions).toEqual([]);
    expect(view.doctor).toBeNull();
    expect(view.medications).toEqual([]);
    expect(view.emergencyContacts).toEqual([]);
  });

  it('picks only the keys a parent sent and merges them', () => {
    const changes = pickChanges({ conditions: ['Asthma', 'Eczema'] });
    expect(Object.keys(changes)).toEqual(['conditions']);
    const merged = mergeProfile(PROFILE, changes);
    expect(merged.conditions).toEqual(['Asthma', 'Eczema']);
    expect(merged.bloodGroup).toBe('B+');
    expect(merged).not.toHaveProperty('updatedAt');
  });

  it('mirrors the structured profile into the legacy text columns', () => {
    const columns = toProfileColumns(
      mergeProfile(PROFILE, {
        allergies: [
          { name: 'Peanuts', severity: 'SEVERE', reaction: null },
          { name: 'Dust', severity: 'MILD', reaction: null },
        ],
      }),
      'user-1',
    );
    expect(columns.allergies).toBe('Peanuts, Dust');
    expect(columns.conditions).toBe('Asthma');
    expect(columns.notes).toBe('Inhaler in bag');
  });
});
