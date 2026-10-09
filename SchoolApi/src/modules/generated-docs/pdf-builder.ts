import PDFDocument from 'pdfkit';

const PRIMARY = '#0B7F74';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';
const LINE = '#DCE8E5';

export interface PdfColumn {
  header: string;
  /** Relative width weight (default 1). */
  weight?: number;
  align?: 'left' | 'right' | 'center';
}

/**
 * Small A4 document helper shared by report cards, challans, receipts,
 * payslips, certificates and PDF reports (same look as the ID card).
 */
export class PdfBuilder {
  readonly doc: PDFKit.PDFDocument;
  private readonly chunks: Buffer[] = [];
  private readonly done: Promise<Buffer>;

  constructor(options: { landscape?: boolean } = {}) {
    this.doc = new PDFDocument({
      size: 'A4',
      layout: options.landscape ? 'landscape' : 'portrait',
      margin: 40,
    });
    this.doc.on('data', (chunk: Buffer) => this.chunks.push(chunk));
    this.done = new Promise<Buffer>((resolve, reject) => {
      this.doc.on('end', () => resolve(Buffer.concat(this.chunks)));
      this.doc.on('error', reject);
    });
  }

  private get width(): number {
    return this.doc.page.width - 80;
  }

  header(schoolName: string, subtitle: string, title: string): this {
    const { doc } = this;
    doc.rect(0, 0, doc.page.width, 70).fill(PRIMARY);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16);
    doc.text(schoolName, 40, 18, { width: this.width });
    doc
      .font('Helvetica')
      .fontSize(9)
      .text(subtitle, 40, 42, { width: this.width });
    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(14);
    doc.text(title, 40, 90, { width: this.width, align: 'center' });
    doc.moveDown(1);
    return this;
  }

  /** Label/value pairs in two columns. */
  fields(pairs: [string, string][]): this {
    const { doc } = this;
    const half = this.width / 2;
    for (let i = 0; i < pairs.length; i += 2) {
      const y = doc.y;
      pairs.slice(i, i + 2).forEach(([label, value], col) => {
        const x = 40 + col * half;
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(MUTED)
          .text(label, x, y, { width: half - 10 });
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(TEXT)
          .text(value || '-', x, y + 10, {
            width: half - 10,
          });
      });
      doc.y = y + 28;
    }
    doc.moveDown(0.5);
    return this;
  }

  heading(text: string): this {
    this.doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(PRIMARY);
    this.doc.text(text, 40, this.doc.y, { width: this.width });
    this.doc.moveDown(0.3);
    return this;
  }

  paragraph(
    text: string,
    options: { align?: 'left' | 'center' | 'justify'; size?: number } = {},
  ): this {
    this.doc
      .font('Helvetica')
      .fontSize(options.size ?? 10)
      .fillColor(TEXT);
    this.doc.text(text, 40, this.doc.y, {
      width: this.width,
      align: options.align ?? 'left',
    });
    this.doc.moveDown(0.5);
    return this;
  }

  table(
    columns: PdfColumn[],
    rows: string[][],
    options: { boldLastRow?: boolean } = {},
  ): this {
    const { doc } = this;
    const total = columns.reduce((sum, c) => sum + (c.weight ?? 1), 0);
    const widths = columns.map((c) => ((c.weight ?? 1) / total) * this.width);
    const drawRow = (cells: string[], bold: boolean, fill?: string) => {
      const height = 18;
      if (doc.y + height > doc.page.height - 50) doc.addPage();
      const y = doc.y;
      if (fill) doc.rect(40, y, this.width, height).fill(fill);
      let x = 40;
      cells.forEach((cell, i) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(8.5)
          .fillColor(TEXT);
        doc.text(cell ?? '', x + 4, y + 5, {
          width: widths[i] - 8,
          align: columns[i].align ?? 'left',
          lineBreak: false,
          ellipsis: true,
        });
        x += widths[i];
      });
      doc
        .moveTo(40, y + height)
        .lineTo(40 + this.width, y + height)
        .lineWidth(0.5)
        .strokeColor(LINE)
        .stroke();
      doc.y = y + height;
    };
    drawRow(
      columns.map((c) => c.header),
      true,
      '#F6F1F3',
    );
    rows.forEach((row, i) =>
      drawRow(row, !!options.boldLastRow && i === rows.length - 1),
    );
    doc.moveDown(0.8);
    return this;
  }

  /** QR image (PNG buffer) at the bottom right with a caption. */
  qr(png: Buffer, caption: string): this {
    const { doc } = this;
    const size = 80;
    const x = doc.page.width - 40 - size;
    const y = Math.max(doc.y, doc.page.height - 170);
    doc.image(png, x, y, { width: size });
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(MUTED)
      .text(caption, x - 60, y + size + 4, {
        width: size + 60,
        align: 'right',
      });
    return this;
  }

  watermark(text: string): this {
    const { doc } = this;
    doc.save();
    doc.rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] });
    doc.font('Helvetica-Bold').fontSize(60).fillColor('#C9B8BE').opacity(0.35);
    doc.text(text, 0, doc.page.height / 2 - 30, {
      width: doc.page.width,
      align: 'center',
    });
    doc.restore();
    doc.opacity(1);
    return this;
  }

  footer(text: string): this {
    const { doc } = this;
    // The footer sits inside the bottom margin; lift the margin while drawing
    // so PDFKit doesn't treat it as overflow and start a blank page.
    const margins = doc.page.margins;
    const bottom = margins.bottom;
    margins.bottom = 0;
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text(text, 40, doc.page.height - 45, {
      width: this.width,
      align: 'center',
      lineBreak: false,
    });
    margins.bottom = bottom;
    return this;
  }

  toBuffer(): Promise<Buffer> {
    this.doc.end();
    return this.done;
  }
}
