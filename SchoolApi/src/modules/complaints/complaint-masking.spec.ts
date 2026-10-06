import { canSeeComplainant, maskPerson } from './complaint-masking';

const anonymous = { anonymous: true, complainantId: 'parent-1' };
const open = { anonymous: false, complainantId: 'parent-1' };
const person = { id: 'parent-1', name: 'Parent' };

describe('complaint masking', () => {
  it('shows a named complainant to everyone', () => {
    expect(canSeeComplainant({ id: 't', activeRole: 'TEACHER' }, open)).toBe(
      true,
    );
  });

  it('hides an anonymous complainant from other staff', () => {
    for (const role of ['TEACHER', 'COORDINATOR', 'HEAD_TEACHER', 'PARENT']) {
      expect(canSeeComplainant({ id: 'x', activeRole: role }, anonymous)).toBe(
        false,
      );
    }
  });

  it('shows an anonymous complainant to principal and super admin', () => {
    expect(
      canSeeComplainant({ id: 'p', activeRole: 'PRINCIPAL' }, anonymous),
    ).toBe(true);
    expect(
      canSeeComplainant({ id: 's', activeRole: 'SUPER_ADMIN' }, anonymous),
    ).toBe(true);
  });

  it('shows the complainant their own anonymous complaint', () => {
    expect(
      canSeeComplainant({ id: 'parent-1', activeRole: 'PARENT' }, anonymous),
    ).toBe(true);
  });

  it('masks update authors only when they are the hidden complainant', () => {
    const viewer = { id: 't', activeRole: 'TEACHER' };
    expect(maskPerson(person, 'parent-1', viewer, anonymous)).toBeNull();
    const teacher = { id: 't', name: 'Teacher' };
    expect(maskPerson(teacher, 't', viewer, anonymous)).toBe(teacher);
    expect(maskPerson(person, 'parent-1', viewer, open)).toBe(person);
    expect(
      maskPerson(
        person,
        'parent-1',
        { id: 'p', activeRole: 'PRINCIPAL' },
        anonymous,
      ),
    ).toBe(person);
  });
});
