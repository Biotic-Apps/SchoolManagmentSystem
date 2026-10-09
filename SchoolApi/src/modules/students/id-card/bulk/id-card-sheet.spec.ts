import { CARD_HEIGHT, CARD_WIDTH } from '../id-card-pdf';
import {
  CARDS_PER_SHEET,
  SHEET_HEIGHT,
  SHEET_WIDTH,
  renderIdCardSheet,
  sheetGrid,
} from './id-card-sheet';

describe('ID card sheet', () => {
  it('fits ten non-overlapping cards inside A4 with room for cut marks', () => {
    const grid = sheetGrid();
    expect(grid.slots).toHaveLength(CARDS_PER_SHEET);
    for (const s of grid.slots) {
      expect(s.x).toBeGreaterThanOrEqual(grid.marginX);
      expect(s.y).toBeGreaterThanOrEqual(grid.marginY);
      expect(s.x + CARD_WIDTH).toBeLessThanOrEqual(
        SHEET_WIDTH - grid.marginX + 0.01,
      );
      expect(s.y + CARD_HEIGHT).toBeLessThanOrEqual(
        SHEET_HEIGHT - grid.marginY + 0.01,
      );
    }
    for (const [i, a] of grid.slots.entries())
      for (const b of grid.slots.slice(i + 1)) {
        const apart =
          a.x + CARD_WIDTH <= b.x ||
          b.x + CARD_WIDTH <= a.x ||
          a.y + CARD_HEIGHT <= b.y ||
          b.y + CARD_HEIGHT <= a.y;
        expect(apart).toBe(true);
      }
    expect(grid.marginY).toBeGreaterThan(14);
    expect(grid.xs).toHaveLength(4);
    expect(grid.ys).toHaveLength(10);
  });

  it('renders one page per ten cards', async () => {
    const card = {
      schoolName: 'Demo School',
      branchName: 'Main',
      branchContact: '0300',
      studentName: 'Ali Khan',
      admissionNo: 'A-1',
      classLabel: 'Class 5 - A',
      publicId: '0199a1b2-0000-7000-8000-000000000001',
      version: null,
      photo: null,
    };
    const pdf = await renderIdCardSheet(Array.from({ length: 11 }, () => card));
    const pages = pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? [];
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pages).toHaveLength(2);
  }, 30_000);
});
