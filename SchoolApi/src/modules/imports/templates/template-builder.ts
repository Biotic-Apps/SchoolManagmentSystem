import ExcelJS from 'exceljs';
import { MAX_ROWS, type ColumnSpec } from '../validation/sheet';

export interface TemplateSpec {
  sheetName: string;
  columns: ColumnSpec[];
  notes: string[];
  /** Overrides the column examples for the sample row. */
  example?: Record<string, string>;
}

const GENERAL_NOTES = [
  `Fill the first sheet: keep the header row, one record per row, at most ${MAX_ROWS} rows. Empty rows are skipped. The example row (row 2) must be replaced or deleted.`,
  'Dates: YYYY-MM-DD (2026-04-01) or DD/MM/YYYY (01/04/2026); Excel date cells work too. Only real calendar dates are accepted.',
  'Phones: Pakistani mobile numbers in any of 03001234567, 3001234567, +923001234567 or 00923001234567; stored as +923001234567.',
  'CNIC / B-Form: 13 digits with or without dashes (12345-1234567-1).',
  "Names: letters in any script, Urdu included (e.g. علی رضا), plus spaces and . ' - ; at most 100 characters.",
  'Amounts: rupees with up to 2 decimals (1500 or 1500.50). Yes/no columns: yes or no.',
  'Upload as .xlsx or .csv (UTF-8, max 5 MB). Errors are reported by spreadsheet row (the header is row 1) and column.',
];

/** Data sheet (frozen header, widths, example row) + Instructions sheet. */
export async function buildTemplate(spec: TemplateSpec): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'eSchool';
  const data = workbook.addWorksheet(spec.sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  data.columns = spec.columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: Math.min(45, Math.max(14, column.header.length + 6)),
    style: { numFmt: '@' },
  }));
  const header = data.getRow(1);
  header.font = { bold: true };
  header.eachCell((cell, col) => {
    const column = spec.columns[col - 1];
    cell.note = `${column.required ? 'Required' : 'Optional'}: ${column.format}`;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: column.required ? 'FFFDE8C8' : 'FFEFEFEF' },
    };
  });
  data.addRow(
    Object.fromEntries(
      spec.columns.map((c) => [c.key, spec.example?.[c.key] ?? c.example]),
    ),
  );

  const help = workbook.addWorksheet('Instructions');
  help.columns = [
    { header: 'Column', key: 'header', width: 24 },
    { header: 'Required', key: 'required', width: 10 },
    { header: 'Format', key: 'format', width: 70 },
    { header: 'Example', key: 'example', width: 30 },
  ];
  help.getRow(1).font = { bold: true };
  for (const column of spec.columns) {
    help.addRow({
      header: column.header,
      required: column.required ? 'Yes' : 'No',
      format: column.format,
      example: column.example,
    });
  }
  help.addRow({});
  help.addRow({ header: 'Notes' }).font = { bold: true };
  for (const note of [...spec.notes, ...GENERAL_NOTES]) {
    const row = help.addRow({ header: '', format: note });
    row.getCell('format').alignment = { wrapText: true, vertical: 'top' };
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
