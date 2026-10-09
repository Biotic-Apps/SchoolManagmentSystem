import PDFDocument from 'pdfkit';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  drawIdCard,
  idCardQr,
  pdfBuffer,
  type IdCardContent,
} from '../id-card-pdf';

// A4 portrait in points.
export const SHEET_WIDTH = 595.28;
export const SHEET_HEIGHT = 841.89;
const COLS = 2;
const ROWS = 5;
const GAP_X = 18;
const GAP_Y = 8;
const MARK = 10;
const MARK_COLOR = '#5F6E72';

export const CARDS_PER_SHEET = COLS * ROWS;

export interface SheetGrid {
  slots: { x: number; y: number }[];
  /** Card edge positions, for cut marks in the page margins. */
  xs: number[];
  ys: number[];
  marginX: number;
  marginY: number;
}

/** 2 x 5 CR80 cards centred on A4 with cut lines at every card edge. */
export function sheetGrid(): SheetGrid {
  const gridW = COLS * CARD_WIDTH + (COLS - 1) * GAP_X;
  const gridH = ROWS * CARD_HEIGHT + (ROWS - 1) * GAP_Y;
  const marginX = (SHEET_WIDTH - gridW) / 2;
  const marginY = (SHEET_HEIGHT - gridH) / 2;
  const slots: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      slots.push({
        x: marginX + c * (CARD_WIDTH + GAP_X),
        y: marginY + r * (CARD_HEIGHT + GAP_Y),
      });
  const xs = [...new Set(slots.flatMap((s) => [s.x, s.x + CARD_WIDTH]))];
  const ys = [...new Set(slots.flatMap((s) => [s.y, s.y + CARD_HEIGHT]))];
  return { slots, xs, ys, marginX, marginY };
}

function cutMarks(doc: PDFKit.PDFDocument, grid: SheetGrid): void {
  const { xs, ys, marginX, marginY } = grid;
  const markX = Math.min(MARK, marginX - 4);
  const markY = Math.min(MARK, marginY - 4);
  doc.save().lineWidth(0.4).strokeColor(MARK_COLOR);
  for (const x of xs) {
    doc
      .moveTo(x, marginY - 2 - markY)
      .lineTo(x, marginY - 2)
      .stroke();
    const bottom = SHEET_HEIGHT - marginY + 2;
    doc
      .moveTo(x, bottom)
      .lineTo(x, bottom + markY)
      .stroke();
  }
  for (const y of ys) {
    doc
      .moveTo(marginX - 2 - markX, y)
      .lineTo(marginX - 2, y)
      .stroke();
    const right = SHEET_WIDTH - marginX + 2;
    doc
      .moveTo(right, y)
      .lineTo(right + markX, y)
      .stroke();
  }
  doc.restore();
}

/** Ten cards per A4 page with cut marks; `onCard` reports progress. */
export async function renderIdCardSheet(
  cards: IdCardContent[],
  onCard?: (done: number) => Promise<void>,
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });
  const done = pdfBuffer(doc);
  const grid = sheetGrid();
  for (const [i, card] of cards.entries()) {
    const slot = i % CARDS_PER_SHEET;
    if (slot === 0) {
      doc.addPage({ size: 'A4', margin: 0 });
      cutMarks(doc, grid);
    }
    const { x, y } = grid.slots[slot];
    drawIdCard(doc, x, y, card, await idCardQr(card.publicId));
    doc
      .rect(x, y, CARD_WIDTH, CARD_HEIGHT)
      .lineWidth(0.3)
      .strokeColor('#DCE8E5')
      .stroke();
    doc
      .rect(x, y, CARD_WIDTH, CARD_HEIGHT)
      .lineWidth(0.3)
      .strokeColor('#DCE8E5')
      .stroke();
    await onCard?.(i + 1);
  }
  if (cards.length === 0) doc.addPage({ size: 'A4', margin: 0 });
  doc.end();
  return done;
}
