import ExcelJS from 'exceljs';
import type { ReportColumn, ReportTable, ReportValue } from '../report-table';
import { minorToMajor } from './cell-format';

const NUM_FMT: Partial<Record<NonNullable<ReportColumn['kind']>, string>> = {
  money: '#,##0.00',
  percent: '0.0',
  int: '0',
};

/** Spreadsheet value: money as a major-unit number parsed from exact text. */
function cellValue(column: ReportColumn, value: ReportValue): string | number {
  if (value === null || value === undefined) return '';
  if (column.kind === 'money' && typeof value !== 'string') {
    return Number(minorToMajor(value));
  }
  if (typeof value === 'bigint') return Number(value);
  return value;
}

/** One sheet: bold header row, typed number columns, frozen header. */
export async function renderXlsx(table: ReportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'eSchool';
  const sheet = workbook.addWorksheet('Report', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = table.columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: Math.min(40, Math.max(12, column.header.length + 4)),
    style: column.kind ? { numFmt: NUM_FMT[column.kind] } : undefined,
  }));
  sheet.getRow(1).font = { bold: true };
  for (const row of table.rows) {
    sheet.addRow(
      Object.fromEntries(
        table.columns.map((c) => [c.key, cellValue(c, row[c.key])]),
      ),
    );
  }
  const data = await workbook.xlsx.writeBuffer();
  return Buffer.from(data);
}
