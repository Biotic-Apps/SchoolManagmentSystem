import { outdatedCard, REPORT_CARD_LAYOUT_SINCE } from './report-cards.service';

describe('outdatedCard', () => {
  const before = new Date(REPORT_CARD_LAYOUT_SINCE.getTime() - 1000);
  const after = new Date(REPORT_CARD_LAYOUT_SINCE.getTime() + 1000);

  it('re-renders ready cards from the old layout only', () => {
    expect(outdatedCard({ status: 'READY', generatedAt: before })).toBe(true);
    expect(outdatedCard({ status: 'READY', generatedAt: after })).toBe(false);
    expect(outdatedCard({ status: 'PENDING', generatedAt: null })).toBe(false);
    expect(outdatedCard({ status: 'FAILED', generatedAt: before })).toBe(false);
  });
});
