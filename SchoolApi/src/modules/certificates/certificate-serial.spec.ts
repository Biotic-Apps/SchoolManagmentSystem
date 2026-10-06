import {
  certificateSequenceKey,
  certificateSerial,
} from './certificate-serial';

describe('certificate serial', () => {
  it('formats CERT-{TYPE}-{YEAR}-{SEQ} with a 4-digit sequence', () => {
    expect(certificateSerial('SCHOOL_LEAVING', 2026, 7)).toBe(
      'CERT-SCHOOL_LEAVING-2026-0007',
    );
    expect(certificateSerial('CHARACTER', 2026, 12345)).toBe(
      'CERT-CHARACTER-2026-12345',
    );
  });

  it('keys the counter per school, type and year', () => {
    expect(certificateSequenceKey('s1', 'TRANSFER', 2027)).toBe(
      'cert:s1:TRANSFER:2027',
    );
  });
});
