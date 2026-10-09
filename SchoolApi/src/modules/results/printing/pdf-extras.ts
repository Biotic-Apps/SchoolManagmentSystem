import type { PdfBuilder } from '../../generated-docs/pdf-builder';

const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';
const RULE = '#9AA7AA';

/** Usable width of a PdfBuilder page (40pt margins). */
export const contentWidth = (pdf: PdfBuilder) => pdf.doc.page.width - 80;

/**
 * Signature lines spread across the page above the footer, e.g.
 * "Class teacher", "Principal". Skipped when the page is too full.
 */
export function signatureLines(pdf: PdfBuilder, labels: string[]): void {
  const { doc } = pdf;
  const y = doc.page.height - 95;
  if (doc.y > y - 10 || labels.length === 0) return;
  const slot = contentWidth(pdf) / labels.length;
  labels.forEach((label, i) => {
    const x = 40 + i * slot + 12;
    const width = slot - 24;
    doc
      .moveTo(x, y)
      .lineTo(x + width, y)
      .lineWidth(0.6)
      .strokeColor(RULE)
      .stroke();
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text(label, x, y + 4, { width, align: 'center', lineBreak: false });
  });
  doc.fillColor(TEXT);
}

export interface GridColumn {
  header: string;
  /** Second header line, e.g. "(100)" for max marks. */
  sub?: string;
  width: number;
  align?: 'left' | 'right' | 'center';
}

/**
 * Fully ruled table (blank sheets to fill by hand). Starts a new page with
 * the header repeated when rows run out of space; `onPage` redraws titles.
 */
export function ruledGrid(
  pdf: PdfBuilder,
  columns: GridColumn[],
  rows: string[][],
  options: { rowHeight?: number; onPage?: () => void; bottom?: number } = {},
): void {
  const { doc } = pdf;
  const rowHeight = options.rowHeight ?? 20;
  const headerHeight = columns.some((c) => c.sub) ? 35 : 18;
  const bottom = doc.page.height - (options.bottom ?? 60);
  const total = columns.reduce((s, c) => s + c.width, 0);
  const scale = contentWidth(pdf) / total;
  const widths = columns.map((c) => c.width * scale);

  const cell = (x: number, y: number, w: number, h: number) =>
    doc.rect(x, y, w, h).lineWidth(0.5).strokeColor(RULE).stroke();

  const header = () => {
    const y = doc.y;
    doc.rect(40, y, contentWidth(pdf), headerHeight).fill('#F6F1F3');
    let x = 40;
    columns.forEach((c, i) => {
      cell(x, y, widths[i], headerHeight);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(TEXT);
      doc.text(c.header, x + 3, y + 4, {
        width: widths[i] - 6,
        height: c.sub ? 20 : 9,
        align: c.align ?? 'left',
        lineBreak: !!c.sub,
        ellipsis: true,
      });
      if (c.sub) {
        doc.font('Helvetica').fontSize(7).fillColor(MUTED);
        doc.text(c.sub, x + 3, y + 24, {
          width: widths[i] - 6,
          align: c.align ?? 'left',
          lineBreak: false,
        });
      }
      x += widths[i];
    });
    doc.y = y + headerHeight;
  };

  header();
  for (const row of rows) {
    if (doc.y + rowHeight > bottom) {
      doc.addPage();
      options.onPage?.();
      header();
    }
    const y = doc.y;
    let x = 40;
    columns.forEach((c, i) => {
      cell(x, y, widths[i], rowHeight);
      doc.font('Helvetica').fontSize(8.5).fillColor(TEXT);
      doc.text(row[i] ?? '', x + 3, y + (rowHeight - 9) / 2, {
        width: widths[i] - 6,
        height: 10,
        align: c.align ?? 'left',
        lineBreak: false,
        ellipsis: true,
      });
      x += widths[i];
    });
    doc.y = y + rowHeight;
  }
  doc.moveDown(0.8);
}

/**
 * Footer line inside the bottom margin. PdfBuilder.footer writes below the
 * page's max Y, which makes PDFKit start an extra blank page.
 */
export function pageFooter(pdf: PdfBuilder, text: string): void {
  const { doc } = pdf;
  const margins = doc.page.margins;
  const bottom = margins.bottom;
  margins.bottom = 0;
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
  doc.text(text, 40, doc.page.height - 45, {
    width: contentWidth(pdf),
    align: 'center',
    lineBreak: false,
  });
  margins.bottom = bottom;
  doc.fillColor(TEXT);
}
