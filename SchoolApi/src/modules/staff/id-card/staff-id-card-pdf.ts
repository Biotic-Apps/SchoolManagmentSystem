import PDFDocument from 'pdfkit';
import { toBuffer as qrToBuffer } from 'qrcode';

export interface StaffIdCardContent {
  schoolName: string;
  branchName: string;
  branchContact: string | null;
  staffName: string;
  employeeNo: string;
  designation: string;
  publicId: string;
  /** Card version printed in the footer; null on bulk sheets. */
  version: number | null;
  photo: Buffer | null;
  phone: string | null;
  email: string | null;
}

// CR80 card, 85.6 x 54 mm in points.
export const CARD_WIDTH = 242.6;
export const CARD_HEIGHT = 153;
const PRIMARY = '#0B7F74';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';

/** QR payload scanned at the gate. */
export const staffIdCardQr = (publicId: string): Promise<Buffer> =>
  qrToBuffer(`ESCHOOL:STAFF:${publicId}`, { margin: 0, width: 160 });

/** Front of the staff ID card. */
export function drawStaffIdCardFront(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  content: StaffIdCardContent,
): void {
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;
  doc.save();
  doc.rect(x, y, W, H).clip();
  // Header band
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

  // Photo placeholder
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

  // Name and designation
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(10);
  doc.text(content.staffName, x + 74, y + 46, {
    width: 110,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font('Helvetica').fontSize(8).fillColor(MUTED);
  doc.text('Designation', x + 74, y + 62, { lineBreak: false });
  doc.text('Employee No', x + 74, y + 84, { lineBreak: false });
  doc.fillColor(TEXT).fontSize(8.5);
  doc.text(content.designation, x + 74, y + 71, {
    width: 110,
    lineBreak: false,
    ellipsis: true,
  });
  doc.text(content.employeeNo || 'N/A', x + 74, y + 93, {
    width: 110,
    lineBreak: false,
  });

  // Footer
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

/** Back of the staff ID card. */
export function drawStaffIdCardBack(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  content: StaffIdCardContent,
  qr: Buffer,
): void {
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;
  doc.save();
  doc.rect(x, y, W, H).clip();
  // Header band
  doc.rect(x, y, W, 24).fill(PRIMARY);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
  doc.text('STAFF IDENTITY CARD', x + 10, y + 7, {
    width: W - 20,
    align: 'center',
    lineBreak: false,
  });

  // Contact info
  let infoY = y + 34;
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);

  if (content.phone) {
    doc.text('Phone:', x + 10, infoY, { lineBreak: false });
    doc
      .fillColor(TEXT)
      .text(content.phone, x + 60, infoY, { lineBreak: false });
    infoY += 12;
    doc.fillColor(MUTED);
  }

  if (content.email) {
    doc.text('Email:', x + 10, infoY, { lineBreak: false });
    doc.fillColor(TEXT).text(content.email, x + 60, infoY, {
      width: W - 70,
      lineBreak: false,
      ellipsis: true,
    });
    infoY += 12;
    doc.fillColor(MUTED);
  }

  doc.text('Branch:', x + 10, infoY, { lineBreak: false });
  doc.fillColor(TEXT).text(content.branchName, x + 60, infoY, {
    width: W - 70,
    lineBreak: false,
    ellipsis: true,
  });

  // QR code
  doc.image(qr, x + W - 58, y + 34, { width: 48 });

  // Footer
  doc.fillColor(MUTED).fontSize(6);
  doc.text(
    'If found, please return to the school office.',
    x + 10,
    y + H - 16,
    {
      width: W - 20,
      align: 'center',
      lineBreak: false,
    },
  );
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

/** Renders a two-page staff ID card (front and back). */
export async function renderStaffIdCard(
  content: StaffIdCardContent,
): Promise<Buffer> {
  const qr = await staffIdCardQr(content.publicId);
  const doc = new PDFDocument({
    size: [CARD_WIDTH, CARD_HEIGHT],
    margin: 0,
    autoFirstPage: false,
  });
  const done = pdfBuffer(doc);
  // Front
  doc.addPage({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
  drawStaffIdCardFront(doc, 0, 0, content);
  // Back
  doc.addPage({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
  drawStaffIdCardBack(doc, 0, 0, content, qr);
  doc.end();
  return done;
}
