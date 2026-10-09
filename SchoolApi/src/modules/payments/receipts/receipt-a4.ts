import PDFDocument from 'pdfkit';
import { formatMinor } from '../../finance-core/money';
import {
  balanceLine,
  RECEIPT_COPIES,
  receiptRows,
  type ReceiptData,
  type ReceiptRow,
} from './receipt-data';

const PRIMARY = '#0B7F74';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';
const LINE = '#DCE8E5';
const SOFT = '#EEF5F3';
const MARGIN = 36;
/** Invoice rows that fit one half page; the rest fold into one row. */
const MAX_INVOICES = 6;

type Doc = PDFKit.PDFDocument;

/** A4 portrait receipt: school copy on top, student copy below a cut line. */
export async function renderA4Receipt(data: ReceiptData): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  const half = doc.page.height / 2;
  RECEIPT_COPIES.forEach((copy, i) =>
    drawCopy(doc, data, copy, i * half, half),
  );
  doc
    .save()
    .moveTo(18, half)
    .lineTo(doc.page.width - 18, half)
    .dash(4, { space: 3 })
    .lineWidth(0.6)
    .strokeColor('#9AA8AB')
    .stroke()
    .undash()
    .restore();
  doc.end();
  return done;
}

function drawCopy(
  doc: Doc,
  data: ReceiptData,
  copy: string,
  top: number,
  height: number,
): void {
  const width = doc.page.width - MARGIN * 2;
  const money = (value: bigint) => formatMinor(value, data.currency);
  doc.rect(MARGIN, top + 24, width, 46).fill(PRIMARY);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(13);
  doc.text(data.schoolName, MARGIN + 12, top + 31, {
    width: width - 140,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font('Helvetica').fontSize(8);
  doc.text(data.branchLine, MARGIN + 12, top + 50, {
    width: width - 140,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(copy.toUpperCase(), MARGIN + width - 124, top + 33, {
    width: 112,
    align: 'right',
  });
  doc
    .font('Helvetica')
    .fontSize(8)
    .text('Payment receipt', MARGIN + width - 124, top + 50, {
      width: 112,
      align: 'right',
    });

  let y = fields(doc, top + 80, width, [
    ['Receipt no', data.receiptNo],
    ['Date', data.receivedOn],
    ['Student', data.studentName],
    ['Admission no', data.admissionNo],
    ['Class', data.classLabel || '-'],
    [
      'Method',
      data.reference ? `${data.method} · ${data.reference}` : data.method,
    ],
  ]);
  y = table(doc, y + 2, width, receiptRows(data, MAX_INVOICES));
  y = total(doc, y, width, 'Amount received', money(data.amountMinor), PRIMARY);
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(TEXT);
  doc.text(data.amountInWords, MARGIN, y + 2, { width });
  const [label, amount] = balanceLine(data);
  y = total(doc, doc.y + 4, width, label, amount, MUTED);

  const signY = top + height - 46;
  doc.font('Helvetica').fontSize(8).fillColor(MUTED);
  doc.text(`Received by ${data.receivedBy}`, MARGIN, signY + 4, {
    width: width / 2,
  });
  doc
    .moveTo(MARGIN + width - 150, signY)
    .lineTo(MARGIN + width, signY)
    .lineWidth(0.5)
    .strokeColor(MUTED)
    .stroke();
  doc.text('Signature & stamp', MARGIN + width - 150, signY + 4, {
    width: 150,
    align: 'center',
  });
  if (data.footer) {
    doc.text(data.footer, MARGIN, signY + 18, {
      width,
      align: 'center',
      height: 12,
      ellipsis: true,
    });
  }
  if (data.reversed) watermark(doc, top, height, data.reversalReason);
}

function fields(
  doc: Doc,
  y: number,
  width: number,
  pairs: ReceiptRow[],
): number {
  const third = width / 3;
  for (let i = 0; i < pairs.length; i += 3) {
    pairs.slice(i, i + 3).forEach(([label, value], col) => {
      const x = MARGIN + col * third;
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(label, x, y, { width: third - 8 });
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(TEXT);
      doc.text(value || '-', x, y + 10, {
        width: third - 8,
        lineBreak: false,
        ellipsis: true,
      });
    });
    y += 27;
  }
  return y;
}

function table(doc: Doc, y: number, width: number, rows: ReceiptRow[]): number {
  const rowH = 15;
  doc.rect(MARGIN, y, width, rowH).fill(SOFT);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(TEXT);
  doc.text('Paid towards', MARGIN + 6, y + 4, { width: width / 2 });
  doc.text('Amount', MARGIN + width / 2, y + 4, {
    width: width / 2 - 6,
    align: 'right',
  });
  y += rowH;
  for (const [label, amount] of rows) {
    doc.font('Helvetica').fontSize(8.5).fillColor(TEXT);
    doc.text(label, MARGIN + 6, y + 4, {
      width: width * 0.65,
      lineBreak: false,
      ellipsis: true,
    });
    doc.text(amount, MARGIN + width / 2, y + 4, {
      width: width / 2 - 6,
      align: 'right',
      lineBreak: false,
    });
    y += rowH;
    doc
      .moveTo(MARGIN, y)
      .lineTo(MARGIN + width, y)
      .lineWidth(0.5)
      .strokeColor(LINE)
      .stroke();
  }
  return y + 4;
}

function total(
  doc: Doc,
  y: number,
  width: number,
  label: string,
  amount: string,
  color: string,
): number {
  doc.rect(MARGIN, y, width, 18).lineWidth(0.8).strokeColor(color).stroke();
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(color);
  doc.text(label, MARGIN + 6, y + 5, { width: width / 2, lineBreak: false });
  doc.text(amount, MARGIN + width / 2, y + 5, {
    width: width / 2 - 6,
    align: 'right',
    lineBreak: false,
  });
  return y + 22;
}

function watermark(
  doc: Doc,
  top: number,
  height: number,
  reason: string | null,
): void {
  const cy = top + height / 2;
  doc.save();
  doc.rotate(-20, { origin: [doc.page.width / 2, cy] });
  doc.font('Helvetica-Bold').fontSize(54).fillColor('#C9B8BE').opacity(0.35);
  doc.text('REVERSED', 0, cy - 30, {
    width: doc.page.width,
    align: 'center',
    lineBreak: false,
  });
  doc.restore();
  doc.opacity(1);
  if (reason) {
    doc.font('Helvetica').fontSize(8).fillColor(TEXT);
    doc.text(`Reversed: ${reason}`, MARGIN, top + height - 62, {
      width: doc.page.width - MARGIN * 2,
      lineBreak: false,
      ellipsis: true,
    });
  }
}
