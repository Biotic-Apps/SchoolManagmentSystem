import PDFDocument from 'pdfkit';
import { toBuffer as qrToBuffer } from 'qrcode';

export interface IdCardContent {
  schoolName: string;
  branchName: string;
  branchContact: string | null;
  studentName: string;
  admissionNo: string;
  classLabel: string;
  publicId: string;
  /** Card version printed in the footer; null on bulk sheets. */
  version: number | null;
  photo: Buffer | null;
}

// CR80 card, 85.6 x 54 mm in points.
export const CARD_WIDTH = 242.6;
export const CARD_HEIGHT = 153;
const PRIMARY = '#0B7F74';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';

/** QR payload scanned at the gate / pickup. */
export const idCardQr = (publicId: string): Promise<Buffer> =>
  qrToBuffer(`ESCHOOL:STUDENT:${publicId}`, { margin: 0, width: 160 });

/** Draws one card with its top-left corner at (x, y). */
export function drawIdCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  content: IdCardContent,
  qr: Buffer,
): void {
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;
  doc.save();
  doc.rect(x, y, W, H).clip();
  doc.rect(x, y, W, 34).fill(PRIMARY);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11);
  doc.text(content.schoolName, x + 10, y + 7, {
    width: W - 20,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font('Helvetica').fontSize(7.5);
  doc.text(content.branchName, x + 10, y + 21, {
    width: W - 20,
    lineBreak: false,
    ellipsis: true,
  });

  doc
    .rect(x + 10, y + 44, 56, 68)
    .lineWidth(0.6)
    .strokeColor('#DCE8E5')
    .stroke();
  if (content.photo) {
    doc.image(content.photo, x + 11, y + 45, {
      fit: [54, 66],
      align: 'center',
      valign: 'center',
    });
  }

  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(10);
  doc.text(content.studentName, x + 74, y + 46, {
    width: 110,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font('Helvetica').fontSize(8).fillColor(MUTED);
  doc.text('Class', x + 74, y + 62, { lineBreak: false });
  doc.text('Admission No', x + 74, y + 84, { lineBreak: false });
  doc.fillColor(TEXT).fontSize(8.5);
  doc.text(content.classLabel, x + 74, y + 71, {
    width: 110,
    lineBreak: false,
    ellipsis: true,
  });
  doc.text(content.admissionNo, x + 74, y + 93, {
    width: 110,
    lineBreak: false,
  });

  doc.image(qr, x + W - 58, y + 46, { width: 48 });

  doc.fillColor(MUTED).fontSize(6.5);
  const footer = [
    content.branchContact,
    content.version ? `v${content.version}` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');
  doc.text(footer, x + 10, y + H - 16, {
    width: W - 20,
    align: 'center',
    lineBreak: false,
  });
  doc.restore();
}

/** Collects a PDFKit document into a buffer once `end()` is called. */
export function pdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

/** Renders a one-page student ID card (backendFlows.md §3.4). */
export async function renderIdCard(content: IdCardContent): Promise<Buffer> {
  const qr = await idCardQr(content.publicId);
  const doc = new PDFDocument({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
  const done = pdfBuffer(doc);
  drawIdCard(doc, 0, 0, content, qr);
  doc.end();
  return done;
}
