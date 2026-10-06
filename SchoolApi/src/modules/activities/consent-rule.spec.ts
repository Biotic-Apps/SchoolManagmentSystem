import type { ConsentStatus } from '../../generated/prisma/client';
import { isConsented, participantViolations } from './consent-rule';

const base = {
  consentRequired: true,
  maxParticipants: null,
  audience: new Set(['a', 'b', 'c', 'd']),
  consents: new Map<string, ConsentStatus>([
    ['a', 'GRANTED'],
    ['b', 'PENDING'],
    ['c', 'DECLINED'],
  ]),
};

describe('consent rule', () => {
  it('treats only GRANTED as consent', () => {
    expect(isConsented('GRANTED')).toBe(true);
    expect(isConsented('PENDING')).toBe(false);
    expect(isConsented('DECLINED')).toBe(false);
    expect(isConsented(undefined)).toBe(false);
  });

  it('accepts students whose consent is granted', () => {
    const v = participantViolations(['a'], base);
    expect(v).toEqual({
      notInAudience: [],
      withoutConsent: [],
      overCapacity: false,
    });
  });

  it('excludes no response, declined and missing consent rows', () => {
    const v = participantViolations(['a', 'b', 'c', 'd'], base);
    expect(v.withoutConsent).toEqual(['b', 'c', 'd']);
  });

  it('ignores consent when the activity does not require it', () => {
    const v = participantViolations(['b', 'c'], {
      ...base,
      consentRequired: false,
    });
    expect(v.withoutConsent).toEqual([]);
  });

  it('rejects students outside the audience', () => {
    const v = participantViolations(['a', 'x'], base);
    expect(v.notInAudience).toEqual(['x']);
  });

  it('enforces maxParticipants on unique students', () => {
    const check = { ...base, consentRequired: false, maxParticipants: 2 };
    expect(participantViolations(['a', 'b', 'a'], check).overCapacity).toBe(
      false,
    );
    expect(participantViolations(['a', 'b', 'c'], check).overCapacity).toBe(
      true,
    );
  });
});
