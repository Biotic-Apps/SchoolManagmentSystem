import type { ConsentStatus } from '../../generated/prisma/client';

/** Only an explicit GRANTED counts; no response (PENDING) is not consent. */
export const isConsented = (status: ConsentStatus | undefined): boolean =>
  status === 'GRANTED';

export interface ParticipantCheck {
  consentRequired: boolean;
  maxParticipants: number | null;
  /** Students of the activity audience. */
  audience: ReadonlySet<string>;
  consents: ReadonlyMap<string, ConsentStatus>;
}

export interface ParticipantViolations {
  notInAudience: string[];
  withoutConsent: string[];
  overCapacity: boolean;
}

/** Why a participant set may not be saved (all empty = valid). */
export function participantViolations(
  studentIds: string[],
  check: ParticipantCheck,
): ParticipantViolations {
  const unique = [...new Set(studentIds)];
  return {
    notInAudience: unique.filter((id) => !check.audience.has(id)),
    withoutConsent: check.consentRequired
      ? unique.filter((id) => !isConsented(check.consents.get(id)))
      : [],
    overCapacity:
      check.maxParticipants !== null && unique.length > check.maxParticipants,
  };
}
