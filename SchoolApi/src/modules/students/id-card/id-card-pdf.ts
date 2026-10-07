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
  version: number;
  photo: Buffer | null;
}

// CR80 card, 85.6 x 54 mm in points.
const WIDTH = 242.6;
const HEIGHT = 153;
const PRIMARY = '#0B7F74';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';

/** Renders a one-page student ID card (backendFlows.md §3.4). */
export async function renderIdCard(content: IdCardContent): Promise<Buffer> {
  const qr = await qrToBuffer(`ESCHOOL:STUDENT:${content.publicId}`, {
    margin: 0,
    width: 160,
  });
  const doc = new PDFDocument({ size: [WIDTH, HEIGHT], margin: 0 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.rect(0, 0, WIDTH, 34).fill(PRIMARY);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11);
  doc.text(content.schoolName, 10, 7, { width: WIDTH - 20, lineBreak: false });
  doc.font('Helvetica').fontSize(7.5);
  doc.text(content.branchName, 10, 21, { width: WIDTH - 20, lineBreak: false });

  doc.rect(10, 44, 56, 68).lineWidth(0.6).strokeColor('#DCE8E5').stroke();
  if (content.photo) {
    doc.image(content.photo, 11, 45, {
      fit: [54, 66],
      align: 'center',
      valign: 'center',
    });
  }

  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(10);
  doc.text(content.studentName, 74, 46, {
    width: 110,
    lineBreak: false,
    ellipsis: true,
  });
  doc.font('Helvetica').fontSize(8).fillColor(MUTED);
  doc.text('Class', 74, 62);
  doc.text('Admission No', 74, 84);
  doc.fillColor(TEXT).fontSize(8.5);
  doc.text(content.classLabel, 74, 71, { width: 110, lineBreak: false });
  doc.text(content.admissionNo, 74, 93, { width: 110, lineBreak: false });

  doc.image(qr, WIDTH - 58, 46, { width: 48 });

  doc.fillColor(MUTED).fontSize(6.5);
  const footer = [content.branchContact, `v${content.version}`]
    .filter(Boolean)
    .join('  ·  ');
  doc.text(footer, 10, HEIGHT - 16, { width: WIDTH - 20, align: 'center' });

  doc.end();
  return done;
}
