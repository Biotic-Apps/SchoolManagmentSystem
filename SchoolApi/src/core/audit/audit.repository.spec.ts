import { actionFilter } from './audit.repository';

describe('actionFilter', () => {
  it('matches a whole area when the action ends with a dot', () => {
    expect(actionFilter('auth.')).toEqual({ startsWith: 'auth.' });
  });

  it('matches one action exactly', () => {
    expect(actionFilter('user.create')).toEqual({ equals: 'user.create' });
  });

  it('does not filter when no action is given', () => {
    expect(actionFilter(undefined)).toBeUndefined();
    expect(actionFilter('')).toBeUndefined();
  });
});
