import PDFDocument from 'pdfkit';
import { toBuffer as qrToBuffer } from 'qrcode';
import { CHALLAN_COPIES, type ChallanView } from './challan-data';
import { drawChallanCopy, type CopyBox } from './challan-copy';

const MARGIN = 16;
const GAP = 14;

/** Equal copy boxes across a page, `GAP` apart (the cut lines sit in the gaps). */
export function copyBoxes(
  pageWidth: number,
  pageHeight: number,
  copies: number,
): CopyBox[] {
  const width = (pageWidth - MARGIN * 2 - GAP * (copies - 1)) / copies;
  return Array.from({ length: copies }, (_, i) => ({
    x: MARGIN + i * (width + GAP),
    y: MARGIN,
    width,
    height: pageHeight - MARGIN * 2,
  }));
}

/**
 * One PDF of challans: an A4 landscape page per invoice with the bank,
 * school and parent copies side by side. Pages are added one at a time so a
 * bulk print never holds every invoice in memory.
 */
export class ChallanPdf {
  private readonly doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 0,
    autoFirstPage: false,
  });
  private readonly chunks: Buffer[] = [];
  private readonly done: Promise<Buffer>;
  pages = 0;

  constructor() {
    this.doc.on('data', (chunk: Buffer) => this.chunks.push(chunk));
    this.done = new Promise<Buffer>((resolve, reject) => {
      this.doc.on('end', () => resolve(Buffer.concat(this.chunks)));
      this.doc.on('error', reject);
    });
  }

  async add(view: ChallanView): Promise<void> {
    const qr = await qrToBuffer(view.reference, { margin: 0, width: 140 });
    this.doc.addPage();
    const { width, height } = this.doc.page;
    const boxes = copyBoxes(width, height, CHALLAN_COPIES.length);
    boxes.forEach((box, i) =>
      drawChallanCopy(this.doc, view, CHALLAN_COPIES[i], box, qr),
    );
    this.cutLines(boxes, height);
    this.pages += 1;
  }

  private cutLines(boxes: CopyBox[], height: number): void {
    for (const box of boxes.slice(1)) {
      const x = box.x - GAP / 2;
      this.doc
        .save()
        .moveTo(x, 8)
        .lineTo(x, height - 8)
        .dash(3, { space: 3 })
        .lineWidth(0.5)
        .strokeColor('#9AA8AB')
        .stroke()
        .undash()
        .restore();
    }
  }

  toBuffer(): Promise<Buffer> {
    if (this.pages === 0) this.doc.addPage();
    this.doc.end();
    return this.done;
  }
}
