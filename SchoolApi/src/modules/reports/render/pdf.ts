import { PdfBuilder } from '../../generated-docs/pdf-builder';
import type { ReportTable } from '../report-table';
import { displayText } from './cell-format';

const NUMERIC = new Set(['int', 'money', 'percent']);

/** Landscape table with the report title; numbers right-aligned. */
export function renderPdf(
  table: ReportTable,
  meta: { schoolName: string; generatedAt: string },
): Promise<Buffer> {
  const pdf = new PdfBuilder({ landscape: true }).header(
    meta.schoolName,
    `Generated ${meta.generatedAt}`,
    table.title,
  );
  pdf.table(
    table.columns.map((c) => ({
      header: c.header,
      align: c.kind && NUMERIC.has(c.kind) ? ('right' as const) : 'left',
      weight: c.kind && NUMERIC.has(c.kind) ? 1 : 1.6,
    })),
    table.rows.map((row) =>
      table.columns.map((c) => displayText(c, row[c.key])),
    ),
  );
  if (table.rows.length === 0) pdf.paragraph('No data for these filters.');
  pdf.footer(`${table.rows.length} rows`);
  return pdf.toBuffer();
}
