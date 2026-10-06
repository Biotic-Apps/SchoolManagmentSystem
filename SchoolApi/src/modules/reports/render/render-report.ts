import type { ReportFormatName } from '../report-catalog';
import type { ReportTable } from '../report-table';
import { renderCsv } from './csv';
import { renderPdf } from './pdf';
import { renderXlsx } from './xlsx';

export interface RenderedReport {
  buffer: Buffer;
  mime: string;
  extension: string;
}

export async function renderReport(
  table: ReportTable,
  format: ReportFormatName,
  meta: { schoolName: string; generatedAt: string },
): Promise<RenderedReport> {
  switch (format) {
    case 'CSV':
      return { buffer: renderCsv(table), mime: 'text/csv', extension: 'csv' };
    case 'XLSX':
      return {
        buffer: await renderXlsx(table),
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
      };
    case 'PDF':
      return {
        buffer: await renderPdf(table, meta),
        mime: 'application/pdf',
        extension: 'pdf',
      };
  }
}
