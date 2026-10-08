import {
  NO_CHANGES,
  NOTHING_YET,
  publishGate,
  stateOf,
} from './timetable-state';

describe('timetable state', () => {
  it('maps statuses, with no row meaning EMPTY (no fake version 0 draft)', () => {
    expect(stateOf(null)).toBe('EMPTY');
    expect(stateOf('DRAFT')).toBe('DRAFT');
    expect(stateOf('PUBLISHED')).toBe('PUBLISHED');
    expect(stateOf('DRAFT_REVISION')).toBe('PUBLISHED_WITH_CHANGES');
  });

  const gate = (over: Partial<Parameters<typeof publishGate>[0]>) =>
    publishGate({
      state: 'DRAFT',
      draftSlotCount: 3,
      errorCount: 0,
      mayPublish: true,
      ...over,
    });

  it('explains why Publish is disabled', () => {
    expect(gate({ state: 'EMPTY', draftSlotCount: 0 })).toEqual({
      canPublish: false,
      publishBlockedReason: NOTHING_YET,
    });
    expect(gate({ state: 'PUBLISHED' }).publishBlockedReason).toBe(NO_CHANGES);
    expect(gate({ errorCount: 2 }).publishBlockedReason).toBe(
      'Fix 2 conflicts first',
    );
    expect(gate({ mayPublish: false }).publishBlockedReason).toBe(
      'Ask the principal to publish',
    );
    expect(gate({ state: 'PUBLISHED_WITH_CHANGES' })).toEqual({
      canPublish: true,
      publishBlockedReason: null,
    });
  });
});
