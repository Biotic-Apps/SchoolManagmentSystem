import { authorizePickup } from './pickup-authorization';

const STUDENT = 'student-1';
const OTHER = 'student-2';

describe('authorizePickup', () => {
  it('allows a verified pickup person of the student', () => {
    const decision = authorizePickup(STUDENT, {
      kind: 'PERSON',
      person: { studentId: STUDENT, status: 'VERIFIED' },
    });
    expect(decision.allowed).toBe(true);
  });

  it.each(['PENDING_VERIFICATION', 'REVOKED'] as const)(
    'blocks a %s pickup person',
    (status) => {
      const decision = authorizePickup(STUDENT, {
        kind: 'PERSON',
        person: { studentId: STUDENT, status },
      });
      expect(decision.allowed).toBe(false);
    },
  );

  it("blocks another student's verified pickup person", () => {
    const decision = authorizePickup(STUDENT, {
      kind: 'PERSON',
      person: { studentId: OTHER, status: 'VERIFIED' },
    });
    expect(decision.allowed).toBe(false);
  });

  it('blocks an unknown pickup person', () => {
    expect(
      authorizePickup(STUDENT, { kind: 'PERSON', person: null }).allowed,
    ).toBe(false);
  });

  it('allows a guardian with a verified link to the student', () => {
    const decision = authorizePickup(STUDENT, {
      kind: 'GUARDIAN',
      links: [
        { studentId: OTHER, status: 'VERIFIED' },
        { studentId: STUDENT, status: 'VERIFIED' },
      ],
    });
    expect(decision.allowed).toBe(true);
  });

  it('blocks a guardian not linked to the student', () => {
    const decision = authorizePickup(STUDENT, {
      kind: 'GUARDIAN',
      links: [{ studentId: OTHER, status: 'VERIFIED' }],
    });
    expect(decision.allowed).toBe(false);
  });

  it.each(['REQUESTED', 'REVOKED'] as const)(
    'blocks a guardian whose link is %s',
    (status) => {
      const decision = authorizePickup(STUDENT, {
        kind: 'GUARDIAN',
        links: [{ studentId: STUDENT, status }],
      });
      expect(decision.allowed).toBe(false);
    },
  );
});
