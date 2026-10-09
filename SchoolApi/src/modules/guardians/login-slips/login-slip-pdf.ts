import PDFDocument from 'pdfkit';
import { toBuffer as qrToBuffer } from 'qrcode';
import { pdfBuffer } from '../../students/id-card/id-card-pdf';

export interface LoginSlipContent {
  schoolName: string;
  logo: Buffer | null;
  helpPhone: string | null;
  childName: string;
  classLabel: string;
  rollNo: number | null;
  admissionNo: string;
  photo: Buffer | null;
  parentName: string;
  email: string | null;
  phone: string | null;
  /** Null: the parent keeps the password they chose. */
  temporaryPassword: string | null;
  loginUrl: string;
}

// A4 portrait, three slips per page with cut lines between them.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 26;
export const SLIPS_PER_PAGE = 3;
const SLIP_W = PAGE_W - 2 * MARGIN;
const SLIP_H = (PAGE_H - 2 * MARGIN) / SLIPS_PER_PAGE - 12;
const PRIMARY = '#0B7F74';
const TINT = '#EEF7F5';
const LINE = '#DCE8E5';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';
const MONO = 'Courier-Bold';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

const one = { lineBreak: false, ellipsis: true } as const;

function header(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  s: LoginSlipContent,
) {
  doc.roundedRect(x, y, SLIP_W, 42, 10).fill(PRIMARY);
  doc.rect(x, y + 30, SLIP_W, 12).fill(PRIMARY);
  let textX = x + 14;
  if (s.logo) {
    doc.roundedRect(x + 10, y + 6, 30, 30, 6).fill('#FFFFFF');
    try {
      doc.image(s.logo, x + 12, y + 8, {
        fit: [26, 26],
        align: 'center',
        valign: 'center',
      });
    } catch {
      // unreadable logo: the name alone still identifies the school
    }
    textX = x + 48;
  }
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(13);
  doc.text(s.schoolName, textX, y + 9, {
    width: SLIP_W - (textX - x) - 150,
    ...one,
  });
  doc.font('Helvetica').fontSize(8).fillColor('#D7EFEB');
  doc.text('Parent portal sign-in', textX, y + 26, { ...one, width: 200 });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
  doc.text('PRIVATE · HAND TO PARENT', x + SLIP_W - 150, y + 17, {
    width: 136,
    align: 'right',
    ...one,
  });
}

function child(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  s: LoginSlipContent,
) {
  const size = 58;
  doc.save();
  doc.circle(x + size / 2, y + size / 2, size / 2).clip();
  if (s.photo) {
    try {
      doc.image(s.photo, x, y, {
        cover: [size, size],
        align: 'center',
        valign: 'center',
      });
    } catch {
      doc.rect(x, y, size, size).fill(TINT);
    }
  } else {
    doc.rect(x, y, size, size).fill(TINT);
    doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(20);
    doc.text(initials(s.childName), x, y + 19, {
      width: size,
      align: 'center',
      lineBreak: false,
    });
  }
  doc.restore();
  const w = 140;
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(11);
  doc.text(s.childName, x, y + size + 10, { width: w, ...one });
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED);
  doc.text(s.classLabel || 'Class not set', x, y + size + 25, {
    width: w,
    ...one,
  });
  // The admission number is the username, printed in the box beside this.
  if (s.rollNo !== null)
    doc.text(`Roll no. ${s.rollNo}`, x, y + size + 38, { width: w, ...one });
}

function credentials(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  s: LoginSlipContent,
) {
  const h = 128;
  doc.roundedRect(x, y, w, h, 8).fill(TINT);
  const left = x + 12;
  const inner = w - 24;
  const label = (text: string, at: number) => {
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text(text.toUpperCase(), left, at, {
      width: inner,
      characterSpacing: 0.6,
      ...one,
    });
  };
  label('Parent', y + 10);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT);
  doc.text(s.parentName, left, y + 20, { width: inner, ...one });
  label('Username', y + 38);
  doc.font(MONO).fontSize(12.5).fillColor(TEXT);
  doc.text(s.admissionNo, left, y + 48, { width: inner, ...one });
  const others = [s.email, s.phone].filter(Boolean).join('  or  ');
  if (others) {
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text(`or ${others}`, left, y + 63, { width: inner, ...one });
  }
  label(s.temporaryPassword ? 'Temporary password' : 'Password', y + 80);
  if (s.temporaryPassword) {
    doc.font(MONO).fontSize(17).fillColor(PRIMARY);
    doc.text(s.temporaryPassword, left, y + 91, {
      width: inner,
      characterSpacing: 1.5,
      ...one,
    });
  } else {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(TEXT);
    doc.text('The password you already chose', left, y + 91, {
      width: inner,
      ...one,
    });
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text('Forgot it? Ask the school office to reset it.', left, y + 105, {
      width: inner,
      ...one,
    });
  }
}

function qr(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  code: Buffer,
  s: LoginSlipContent,
) {
  const size = 92;
  doc
    .roundedRect(x - 6, y - 6, size + 12, size + 12, 8)
    .lineWidth(0.8)
    .strokeColor(LINE)
    .stroke();
  doc.image(code, x, y, { width: size });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(TEXT);
  doc.text('Scan to sign in', x - 6, y + size + 10, {
    width: size + 12,
    align: 'center',
    lineBreak: false,
  });
  doc.font('Helvetica').fontSize(6.5).fillColor(MUTED);
  doc.text(s.loginUrl.replace(/^https?:\/\//, ''), x - 10, y + size + 21, {
    width: size + 20,
    align: 'center',
    ...one,
  });
}

function steps(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  s: LoginSlipContent,
) {
  const items = [
    `Open ${s.loginUrl.replace(/^https?:\/\//, '')} or the eSchool app`,
    s.temporaryPassword
      ? 'Type the username and temporary password'
      : 'Type the username and your password',
    s.temporaryPassword
      ? 'Choose your own new password'
      : "See your child's day, fees and results",
  ];
  const w = (SLIP_W - 28 - 16) / 3;
  items.forEach((text, i) => {
    const cx = x + 14 + i * (w + 8);
    doc.circle(cx + 8, y + 8, 8).fill(PRIMARY);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
    doc.text(String(i + 1), cx, y + 4.5, {
      width: 16,
      align: 'center',
      lineBreak: false,
    });
    doc.font('Helvetica').fontSize(7.5).fillColor(TEXT);
    doc.text(text, cx + 21, y + 1, {
      width: w - 23,
      height: 22,
      ellipsis: true,
    });
  });
}

function footer(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  s: LoginSlipContent,
) {
  const note = s.temporaryPassword
    ? 'You must change this password the first time you sign in. Keep this slip private.'
    : 'Keep this slip private. Never share your password, even with school staff.';
  const help = s.helpPhone ? `  Help: ${s.helpPhone}` : '';
  doc.font('Helvetica').fontSize(7).fillColor(MUTED);
  doc.text(`${note}${help}`, x + 14, y, { width: SLIP_W - 28, ...one });
}

/** Draws one slip with its top-left corner at (x, y). */
export function drawLoginSlip(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  s: LoginSlipContent,
  code: Buffer,
) {
  doc.save();
  doc
    .roundedRect(x, y, SLIP_W, SLIP_H, 10)
    .lineWidth(0.8)
    .strokeColor(LINE)
    .stroke();
  header(doc, x, y, s);
  const top = y + 56;
  child(doc, x + 16, top, s);
  credentials(doc, x + 168, top, SLIP_W - 168 - 130, s);
  qr(doc, x + SLIP_W - 112, top + 6, code, s);
  steps(doc, x, y + SLIP_H - 52, s);
  footer(doc, x, y + SLIP_H - 18, s);
  doc.restore();
}

function cutLine(doc: PDFKit.PDFDocument, y: number) {
  doc.save().lineWidth(0.5).dash(4, { space: 3 }).strokeColor('#9AA7AA');
  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_W - MARGIN, y)
    .stroke();
  doc.undash().restore();
}

/** Three slips per A4 page; the QR code of each opens the sign-in page. */
export async function renderLoginSlips(
  slips: LoginSlipContent[],
  onSlip?: (done: number) => Promise<void>,
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });
  const done = pdfBuffer(doc);
  const codes = new Map<string, Buffer>();
  const pitch = (PAGE_H - 2 * MARGIN) / SLIPS_PER_PAGE;
  for (const [i, slip] of slips.entries()) {
    const slot = i % SLIPS_PER_PAGE;
    if (slot === 0) doc.addPage({ size: 'A4', margin: 0 });
    let code = codes.get(slip.loginUrl);
    if (!code) {
      code = await qrToBuffer(`${slip.loginUrl}?role=parent`, {
        margin: 0,
        width: 240,
      });
      codes.set(slip.loginUrl, code);
    }
    const y = MARGIN + slot * pitch;
    drawLoginSlip(doc, MARGIN, y, slip, code);
    if (slot < SLIPS_PER_PAGE - 1 && i < slips.length - 1)
      cutLine(doc, y + pitch - 6);
    await onSlip?.(i + 1);
  }
  if (slips.length === 0) doc.addPage({ size: 'A4', margin: 0 });
  doc.end();
  return done;
}
