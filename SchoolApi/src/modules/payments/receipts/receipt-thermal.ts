import PDFDocument from 'pdfkit';
import { formatMinor } from '../../finance-core/money';
import { balanceLine, receiptRows, type ReceiptData } from './receipt-data';

/** 80 mm roll in points; 3 mm side margins leave a 74 mm print line. */
export const THERMAL_WIDTH = 226.77;
const SIDE = 9;
const FONT_SIZE = 7.8;
/** Courier glyphs are 0.6 em wide, so a line holds this many characters. */
export const THERMAL_COLUMNS = Math.floor(
  (THERMAL_WIDTH - SIDE * 2) / (FONT_SIZE * 0.6),
);
const LINE_HEIGHT = FONT_SIZE * 1.3;

export interface ThermalLine {
  text: string;
  bold?: boolean;
  center?: boolean;
}

/** Word-wraps `text` to `columns` characters (long words are cut). */
export function wrap(text: string, columns: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    let rest = word;
    while (rest.length > columns) {
      if (line) lines.push(line);
      lines.push(rest.slice(0, columns));
      rest = rest.slice(columns);
      line = '';
    }
    if (!line) line = rest;
    else if (line.length + 1 + rest.length <= columns) line += ` ${rest}`;
    else {
      lines.push(line);
      line = rest;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** `left ....... right` on one line; a long label wraps above the amount. */
export function pair(left: string, right: string, columns: number): string[] {
  const room = columns - right.length - 1;
  const parts = wrap(left, Math.max(room, 8));
  const last = parts.pop() ?? '';
  if (last.length > room) return [...parts, last, right.padStart(columns)];
  return [
    ...parts,
    `${last}${' '.repeat(columns - last.length - right.length)}${right}`,
  ];
}

/** Every printed line of an 80 mm receipt, top to bottom. */
export function thermalLines(
  data: ReceiptData,
  columns = THERMAL_COLUMNS,
): ThermalLine[] {
  const rule: ThermalLine = { text: '-'.repeat(columns) };
  const plain = (text: string): ThermalLine => ({ text });
  const centered = (text: string, bold = false) =>
    wrap(text, columns).map((t) => ({ text: t, center: true, bold }));
  // Label column of 9, value wrapped beside it (continuation lines indented).
  const field = (label: string, value: string) =>
    wrap(value, columns - 9).map((text, i) =>
      plain(`${(i === 0 ? label : '').padEnd(9)}${text}`),
    );
  const money = (value: bigint) => formatMinor(value, data.currency);
  return [
    ...centered(data.schoolName, true),
    ...centered(data.branchLine),
    rule,
    ...centered(
      data.reversed ? 'PAYMENT RECEIPT - REVERSED' : 'PAYMENT RECEIPT',
      true,
    ),
    ...field('Receipt', data.receiptNo),
    ...field('Date', data.receivedOn),
    ...field('Student', data.studentName),
    ...field('Adm no', data.admissionNo),
    ...(data.classLabel ? field('Class', data.classLabel) : []),
    ...field('Method', data.method),
    ...(data.reference ? field('Ref', data.reference) : []),
    rule,
    ...receiptRows(data).flatMap(([label, amount]) =>
      pair(label, amount, columns).map(plain),
    ),
    rule,
    ...pair('TOTAL PAID', money(data.amountMinor), columns).map((text) => ({
      text,
      bold: true,
    })),
    ...wrap(data.amountInWords, columns).map(plain),
    ...pair(...balanceLine(data), columns).map(plain),
    rule,
    ...field('Cashier', data.receivedBy),
    ...(data.reversed
      ? centered(
          `Reversed${data.reversalReason ? `: ${data.reversalReason}` : ''}`,
          true,
        )
      : []),
    ...(data.footer ? centered(data.footer) : []),
    ...centered('Thank you'),
  ];
}

/** Receipt for 80 mm thermal printers: one long page, monospace. */
export async function renderThermalReceipt(data: ReceiptData): Promise<Buffer> {
  const lines = thermalLines(data);
  const height = SIDE * 2 + lines.length * LINE_HEIGHT + 12;
  const doc = new PDFDocument({ size: [THERMAL_WIDTH, height], margin: 0 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  lines.forEach((line, i) => {
    doc
      .font(line.bold ? 'Courier-Bold' : 'Courier')
      .fontSize(FONT_SIZE)
      .fillColor('#000000');
    doc.text(line.text, SIDE, SIDE + i * LINE_HEIGHT, {
      width: THERMAL_WIDTH - SIDE * 2,
      align: line.center ? 'center' : 'left',
      lineBreak: false,
    });
  });
  doc.end();
  return done;
}
