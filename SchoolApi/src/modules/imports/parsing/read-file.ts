import { extname } from 'node:path';
import ExcelJS from 'exceljs';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { invalid } from '../../../core/common/errors/errors';
import { MAX_ROWS } from '../validation/sheet';
import { decodeCsv, parseCsv } from './csv';

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export type ImportFormat = 'xlsx' | 'csv';

export const IMPORT_MIME: Record<ImportFormat, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
};

export interface ImportUpload {
  originalname: string;
  size: number;
  buffer: Buffer;
}

const ZIP = [0x50, 0x4b, 0x03, 0x04];

/** Extension + size + content signature (zip for xlsx, UTF-8 text for csv). */
export function checkImportFile(file: ImportUpload | undefined): ImportFormat {
  if (!file) throw invalid('file is required');
  const extension = extname(file.originalname).slice(1).toLowerCase();
  if (extension !== 'xlsx' && extension !== 'csv') {
    throw invalid('Only .xlsx or .csv files can be imported');
  }
  if (file.size > MAX_IMPORT_BYTES || file.buffer.length > MAX_IMPORT_BYTES) {
    throw new AppError(ErrorCode.PAYLOAD_TOO_LARGE, 'File exceeds 5 MB');
  }
  if (extension === 'xlsx') {
    if (!ZIP.every((byte, i) => file.buffer[i] === byte)) {
      throw invalid('File content does not match its type');
    }
  } else {
    decodeCsv(file.buffer);
  }
  return extension;
}

type Cell = ExcelJS.CellValue;

/** Cell → text; date cells become `YYYY-MM-DD`. */
export function cellText(value: Cell): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : String(+value.toFixed(6));
  }
  if (typeof value === 'string' || typeof value === 'boolean') {
    return String(value);
  }
  if ('richText' in value) return value.richText.map((r) => r.text).join('');
  if ('result' in value) return cellText(value.result);
  if ('text' in value) return String(value.text);
  return '';
}

/** First worksheet as a text grid (row 0 = header). */
export async function readGrid(
  buffer: Buffer,
  format: ImportFormat,
): Promise<string[][]> {
  if (format === 'csv') return parseCsv(decodeCsv(buffer));
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    throw invalid('The spreadsheet could not be read');
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  if (sheet.actualRowCount > MAX_ROWS + 1) {
    throw invalid(`At most ${MAX_ROWS} rows per import`);
  }
  const grid: string[][] = [];
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const values: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      values[col - 1] = cellText(cell.value);
    });
    grid[rowNumber - 1] = Array.from(values, (v) => v ?? '');
  });
  return Array.from(grid, (row) => row ?? []);
}
