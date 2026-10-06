import { callerTracker, ipTracker } from './request-tracker';

describe('throttler trackers', () => {
  it('tracks anonymous callers by req.ip', () => {
    expect(callerTracker({ ip: '203.0.113.7', headers: {} })).toBe(
      'ip:203.0.113.7',
    );
    expect(ipTracker({ ip: '203.0.113.7' })).toBe('ip:203.0.113.7');
  });

  it('tracks authenticated callers by a hash of their token', () => {
    const a = callerTracker({
      ip: '203.0.113.7',
      headers: { authorization: 'Bearer token-a' },
    });
    const b = callerTracker({
      ip: '203.0.113.7',
      headers: { authorization: 'Bearer token-b' },
    });
    expect(a).toMatch(/^tok:/);
    expect(a).not.toContain('token-a');
    expect(a).not.toBe(b);
  });

  it('ignores non-bearer authorization headers', () => {
    expect(
      callerTracker({
        ip: '198.51.100.1',
        headers: { authorization: 'Basic x' },
      }),
    ).toBe('ip:198.51.100.1');
  });
});
