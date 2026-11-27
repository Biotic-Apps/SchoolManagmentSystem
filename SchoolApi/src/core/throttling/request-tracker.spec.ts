import { credentialTracker, callerTracker, ipTracker } from './request-tracker';

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

describe('credentialTracker', () => {
  it('splits the credential budget per account, case-insensitively', () => {
    const a = credentialTracker({
      ip: '203.0.113.7',
      body: { identifier: 'A@x.pk' },
    });
    const a2 = credentialTracker({
      ip: '203.0.113.7',
      body: { identifier: ' a@x.pk ' },
    });
    const b = credentialTracker({
      ip: '203.0.113.7',
      body: { identifier: 'b@x.pk' },
    });
    expect(a).toBe(a2);
    expect(a).not.toBe(b);
    expect(a.startsWith('ip:203.0.113.7:acct:')).toBe(true);
    expect(a).not.toContain('a@x.pk');
  });

  it('falls back to the IP without an account field', () => {
    expect(
      credentialTracker({ ip: '203.0.113.7', body: { refreshToken: 'x' } }),
    ).toBe('ip:203.0.113.7');
    expect(credentialTracker({ ip: '203.0.113.7' })).toBe('ip:203.0.113.7');
  });
});
