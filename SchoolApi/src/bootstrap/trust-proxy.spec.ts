import { trustProxySetting } from './trust-proxy';

describe('trustProxySetting', () => {
  it('trusts loopback by default outside production', () => {
    expect(trustProxySetting(undefined, false)).toBe('loopback');
  });

  it('trusts nobody by default in production', () => {
    expect(trustProxySetting(undefined, true)).toBe(false);
    expect(trustProxySetting([], true)).toBe(false);
  });

  it('uses the explicit allow-list when set', () => {
    expect(trustProxySetting(['10.0.0.0/8'], true)).toEqual(['10.0.0.0/8']);
  });
});
