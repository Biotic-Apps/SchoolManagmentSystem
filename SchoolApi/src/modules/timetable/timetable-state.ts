import type { TimetableStatus } from '../../generated/prisma/client';
import type { TimetableState } from './dto/timetable.dto';

export function stateOf(status: TimetableStatus | null): TimetableState {
  switch (status) {
    case null:
      return 'EMPTY';
    case 'DRAFT':
      return 'DRAFT';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'DRAFT_REVISION':
      return 'PUBLISHED_WITH_CHANGES';
  }
}

export interface PublishGateInput {
  state: TimetableState;
  draftSlotCount: number;
  errorCount: number;
  mayPublish: boolean;
}

export interface PublishGate {
  canPublish: boolean;
  publishBlockedReason: string | null;
}

export const NOTHING_YET = 'Add at least one lesson first';
export const NO_CHANGES = 'No changes since the last publish';

/** Publish is one step; when disabled the UI shows the reason (contract D6). */
export function publishGate(input: PublishGateInput): PublishGate {
  const blocked = (reason: string) => ({
    canPublish: false,
    publishBlockedReason: reason,
  });
  if (input.state === 'EMPTY' || input.draftSlotCount === 0)
    return blocked(NOTHING_YET);
  if (input.state === 'PUBLISHED') return blocked(NO_CHANGES);
  if (input.errorCount > 0)
    return blocked(
      `Fix ${input.errorCount} conflict${input.errorCount === 1 ? '' : 's'} first`,
    );
  if (!input.mayPublish) return blocked('Ask the principal to publish');
  return { canPublish: true, publishBlockedReason: null };
}
