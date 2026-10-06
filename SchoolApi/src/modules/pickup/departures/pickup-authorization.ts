import type {
  GuardianLinkStatus,
  PickupPersonStatus,
} from '../../../generated/prisma/client';

export type Picker =
  | {
      kind: 'PERSON';
      person: { studentId: string; status: PickupPersonStatus } | null;
    }
  | {
      kind: 'GUARDIAN';
      links: { studentId: string; status: GuardianLinkStatus }[];
    };

export type PickupDecision =
  { allowed: true } | { allowed: false; reason: string };

/** Gate rule: only a verified pickup person or verified guardian of the child. */
export function authorizePickup(
  studentId: string,
  picker: Picker,
): PickupDecision {
  if (picker.kind === 'PERSON') {
    const person = picker.person;
    if (!person) return { allowed: false, reason: 'Unknown pickup person' };
    if (person.studentId !== studentId)
      return {
        allowed: false,
        reason: 'Pickup person is not linked to this student',
      };
    if (person.status !== 'VERIFIED')
      return { allowed: false, reason: `Pickup person is ${person.status}` };
    return { allowed: true };
  }
  const verified = picker.links.some(
    (link) => link.studentId === studentId && link.status === 'VERIFIED',
  );
  return verified
    ? { allowed: true }
    : { allowed: false, reason: 'Guardian is not verified for this student' };
}
