import type { ReportTable } from '../report-table';
import { cellText } from './cell-format';

const BOM = String.fromCharCode(0xfeff);

/** RFC 4180 field: quoted when it holds a comma, quote, CR or LF. */
export function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** UTF-8 with BOM (Excel opens Urdu names correctly), CRLF line ends. */
export function renderCsv(table: ReportTable): Buffer {
  const lines = [
    table.columns.map((c) => csvField(c.header)).join(','),
    ...table.rows.map((row) =>
      table.columns.map((c) => csvField(cellText(c, row[c.key]))).join(','),
    ),
  ];
  return Buffer.from(BOM + lines.join('\r\n') + '\r\n', 'utf8');
}
