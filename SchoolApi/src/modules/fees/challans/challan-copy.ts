import { formatMinor } from '../../finance-core/money';
import type { ChallanView } from './challan-data';

const PRIMARY = '#0B7F74';
const LATE = '#9A3412';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';
const LINE = '#C9D6D3';
const SOFT = '#EEF5F3';
const DEFAULT_NOTE =
  'Fee once paid is not refundable. Keep this copy as proof of payment.';

export interface CopyBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Doc = PDFKit.PDFDocument;
type Row = [string, string];

/** Draws one tear-off copy (bank / school / parent) of a challan into `box`. */
export function drawChallanCopy(
  doc: Doc,
  view: ChallanView,
  copy: string,
  box: CopyBox,
  qr: Buffer,
): void {
  const pad = 8;
  const x = box.x + pad;
  const w = box.width - pad * 2;
  const money = (v: bigint) => formatMinor(v, view.currency);
  doc
    .lineWidth(0.8)
    .strokeColor(LINE)
    .rect(box.x, box.y, box.width, box.height)
    .stroke();

  let y = header(doc, view, copy, x, box.y + pad, w);
  y = bankBox(doc, view, x, y, w);
  y = infoRows(doc, x, y, w, [
    ['Challan no', view.challanNo],
    ['Fee month', view.month],
    ['Issue date', view.issueDate],
    ['Due date', view.dueDate],
    ['Student', view.student.name],
    ['Father / Guardian', view.student.fatherName ?? '-'],
    ['Admission no', view.student.admissionNo],
    ['Class', view.student.classLabel || '-'],
  ]);
  y = feeTable(doc, x, y + 2, w, feeRows(view, money));
  y = totalRow(
    doc,
    { x, y, w },
    `Payable by ${view.dueDate}`,
    money(view.payableMinor),
    PRIMARY,
  );
  if (view.afterDue) {
    y = totalRow(
      doc,
      { x, y, w },
      `Payable after ${view.afterDue.date}`,
      money(view.afterDue.amountMinor),
      LATE,
    );
  }
  doc.font('Helvetica-Oblique').fontSize(6.8).fillColor(TEXT);
  doc.text(view.amountInWords, x, y + 3, { width: w });
  const footerY = Math.max(doc.y + 6, box.y + box.height - pad - 56);
  // Room left between the totals and the footer: the bank fills this in.
  if (footerY - doc.y > 80) bankUse(doc, x, footerY - 70, w);
  footer(doc, view, { x, y: footerY, w }, qr);
  if (view.watermark) watermark(doc, view.watermark, box);
}

function feeRows(view: ChallanView, money: (v: bigint) => string): Row[] {
  const rows: Row[] = view.feeRows.map(([head, amount]) => [
    head,
    money(amount),
  ]);
  if (view.arrearsMinor > 0n)
    rows.push([view.arrearsLabel, money(view.arrearsMinor)]);
  if (view.concessionMinor > 0n)
    rows.push(['Concession', `- ${money(view.concessionMinor)}`]);
  if (view.siblingDiscountMinor > 0n)
    rows.push(['Sibling discount', `- ${money(view.siblingDiscountMinor)}`]);
  if (view.lateFeeMinor > 0n) rows.push(['Late fee', money(view.lateFeeMinor)]);
  if (view.paidMinor > 0n)
    rows.push(['Already paid', `- ${money(view.paidMinor)}`]);
  return rows;
}

function header(
  doc: Doc,
  view: ChallanView,
  copy: string,
  x: number,
  y: number,
  w: number,
): number {
  let textX = x;
  if (view.school.logo) {
    try {
      doc.image(view.school.logo, x, y, { fit: [30, 30] });
      textX = x + 36;
    } catch {
      // Unreadable logo image: the challan prints without it.
    }
  }
  const pill = 60;
  const textW = w - (textX - x) - pill - 4;
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(TEXT);
  doc.text(view.school.schoolName, textX, y, {
    width: textW,
    height: 24,
    ellipsis: true,
  });
  doc.font('Helvetica').fontSize(6.8).fillColor(MUTED);
  doc.text(view.school.branchLine, textX, doc.y + 1, {
    width: textW,
    height: 18,
    ellipsis: true,
  });
  const textBottom = doc.y;
  doc.roundedRect(x + w - pill, y, pill, 14, 3).fill(PRIMARY);
  doc.font('Helvetica-Bold').fontSize(6.8).fillColor('#FFFFFF');
  doc.text(copy.toUpperCase(), x + w - pill, y + 4, {
    width: pill,
    align: 'center',
    lineBreak: false,
  });
  const bottom = Math.max(textBottom, y + 32) + 4;
  doc
    .moveTo(x, bottom)
    .lineTo(x + w, bottom)
    .lineWidth(0.6)
    .strokeColor(LINE)
    .stroke();
  return bottom + 5;
}

function bankBox(
  doc: Doc,
  view: ChallanView,
  x: number,
  y: number,
  w: number,
): number {
  const bank = view.school.bank;
  const lines: Row[] = bank
    ? [
        ['Bank', bank.bankName || '-'],
        ['Account title', bank.accountTitle || '-'],
        ['Account no', bank.accountNumber || '-'],
        ['Branch code', bank.branchCode || '-'],
      ]
    : [['Pay at', 'School fee counter']];
  const height = lines.length * 10 + 6;
  doc.rect(x, y, w, height).fill(SOFT);
  lines.forEach(([label, value], i) => {
    const rowY = y + 4 + i * 10;
    doc.font('Helvetica').fontSize(6.8).fillColor(MUTED);
    doc.text(label, x + 4, rowY, { width: 62, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(7.2).fillColor(TEXT);
    doc.text(value, x + 66, rowY - 0.5, {
      width: w - 70,
      lineBreak: false,
      ellipsis: true,
    });
  });
  return y + height + 5;
}

function infoRows(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  pairs: Row[],
): number {
  const half = w / 2;
  for (let i = 0; i < pairs.length; i += 2) {
    pairs.slice(i, i + 2).forEach(([label, value], col) => {
      const cx = x + col * half;
      doc.font('Helvetica').fontSize(6.2).fillColor(MUTED);
      doc.text(label, cx, y, { width: half - 4, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(7.6).fillColor(TEXT);
      doc.text(value || '-', cx, y + 7, {
        width: half - 4,
        lineBreak: false,
        ellipsis: true,
      });
    });
    y += 19;
  }
  return y;
}

function feeTable(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  rows: Row[],
): number {
  const rowH = 12;
  const amountX = x + w * 0.45;
  const amountW = w * 0.55 - 4;
  doc.rect(x, y, w, rowH).fill(SOFT);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(TEXT);
  doc.text('Fee head', x + 4, y + 3, { width: w * 0.5, lineBreak: false });
  doc.text('Amount', amountX, y + 3, {
    width: amountW,
    align: 'right',
    lineBreak: false,
  });
  y += rowH;
  for (const [label, amount] of rows) {
    doc.font('Helvetica').fontSize(7.2).fillColor(TEXT);
    doc.text(label, x + 4, y + 3, {
      width: w * 0.62,
      lineBreak: false,
      ellipsis: true,
    });
    doc.text(amount, amountX, y + 3, {
      width: amountW,
      align: 'right',
      lineBreak: false,
    });
    y += rowH;
    doc
      .moveTo(x, y)
      .lineTo(x + w, y)
      .lineWidth(0.4)
      .strokeColor(LINE)
      .stroke();
  }
  return y + 4;
}

function totalRow(
  doc: Doc,
  at: { x: number; y: number; w: number },
  label: string,
  amount: string,
  color: string,
): number {
  const { x, y, w } = at;
  const h = 15;
  doc.rect(x, y, w, h).lineWidth(0.8).strokeColor(color).stroke();
  doc.font('Helvetica-Bold').fontSize(7.6).fillColor(color);
  doc.text(label, x + 4, y + 4, {
    width: w * 0.58,
    lineBreak: false,
    ellipsis: true,
  });
  doc.text(amount, x + w * 0.4, y + 4, {
    width: w * 0.6 - 4,
    align: 'right',
    lineBreak: false,
  });
  return y + h + 2;
}

function bankUse(doc: Doc, x: number, y: number, w: number): void {
  doc
    .rect(x, y, w, 60)
    .lineWidth(0.6)
    .dash(2, { space: 2 })
    .strokeColor(MUTED)
    .stroke()
    .undash();
  doc.font('Helvetica-Bold').fontSize(6.8).fillColor(MUTED);
  doc.text('FOR BANK USE', x + 4, y + 4, { width: w - 8, lineBreak: false });
  ['Amount received', 'Date received', 'Transaction / scroll no'].forEach(
    (label, i) => {
      const rowY = y + 20 + i * 13;
      doc.font('Helvetica').fontSize(6.6).fillColor(MUTED);
      doc.text(label, x + 4, rowY, { width: 90, lineBreak: false });
      doc
        .moveTo(x + 96, rowY + 7)
        .lineTo(x + w - 6, rowY + 7)
        .lineWidth(0.4)
        .strokeColor(LINE)
        .stroke();
    },
  );
}

function footer(
  doc: Doc,
  view: ChallanView,
  at: { x: number; y: number; w: number },
  qr: Buffer,
): void {
  const { x, y, w } = at;
  const size = 46;
  doc.image(qr, x, y, { width: size });
  const noteX = x + size + 6;
  const noteW = w - size - 6;
  doc.font('Helvetica').fontSize(6.2).fillColor(MUTED);
  doc.text(view.school.note || DEFAULT_NOTE, noteX, y, {
    width: noteW,
    height: 24,
    ellipsis: true,
  });
  const signY = y + size;
  const half = noteW / 2;
  ['Depositor', 'Bank stamp & sign'].forEach((label, i) => {
    const sx = noteX + i * half;
    doc
      .moveTo(sx, signY)
      .lineTo(sx + half - 8, signY)
      .lineWidth(0.5)
      .strokeColor(MUTED)
      .stroke();
    doc.font('Helvetica').fontSize(6).fillColor(MUTED);
    doc.text(label, sx, signY + 2, { width: half - 8, lineBreak: false });
  });
}

function watermark(doc: Doc, text: string, box: CopyBox): void {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  doc.save();
  doc.rotate(-35, { origin: [cx, cy] });
  doc.font('Helvetica-Bold').fontSize(40).fillColor('#C9B8BE').opacity(0.3);
  doc.text(text, box.x - 40, cy - 20, {
    width: box.width + 80,
    align: 'center',
    lineBreak: false,
  });
  doc.restore();
  doc.opacity(1);
}
