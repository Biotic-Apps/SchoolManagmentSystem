import {
  planCounts,
  slipAction,
  type SlipGuardianState,
} from './login-slip-plan';

const parent = (
  user: SlipGuardianState['user'],
  guardianId = 'g-1',
): SlipGuardianState => ({ guardianId, user });
const active = (
  over: Partial<NonNullable<SlipGuardianState['user']>> = {},
) => ({
  status: 'ACTIVE',
  lastLoginAt: null,
  staffRoles: 0,
  ...over,
});

describe('slipAction', () => {
  it('creates a login for a guardian without one', () => {
    expect(slipAction(parent(null))).toBe('CREATE');
  });

  it('replaces the temporary password only of parents who never signed in', () => {
    expect(slipAction(parent(active()))).toBe('RESET');
    expect(slipAction(parent(active({ lastLoginAt: new Date() })))).toBe(
      'KEEP',
    );
  });

  it('never resets staff logins or prints disabled ones', () => {
    expect(slipAction(parent(active({ staffRoles: 1 })))).toBe('KEEP');
    expect(slipAction(parent(active({ status: 'DISABLED' })))).toBe('SKIP');
    expect(slipAction(null)).toBe('SKIP');
  });
});

describe('planCounts', () => {
  it('counts a guardian of two children once but prints both slips', () => {
    const counts = planCounts([
      { studentId: 's1', guardian: parent(active(), 'g-1') },
      { studentId: 's2', guardian: parent(active(), 'g-1') },
      { studentId: 's3', guardian: parent(null, 'g-2') },
      { studentId: 's4', guardian: null },
    ]);
    expect(counts).toEqual({
      students: 4,
      slips: 3,
      create: 1,
      reset: 1,
      keep: 0,
      skip: 1,
    });
  });
});
