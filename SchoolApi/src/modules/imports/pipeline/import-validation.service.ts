import { extname } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { AppError } from '../../../core/common/errors/app-error';
import { toJson } from '../../../core/common/prisma-json';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ImportKinds } from '../kinds/import-kinds';
import { readGrid, type ImportFormat } from '../parsing/read-file';
import { mapSheet, type RowError } from '../validation/sheet';
import { streamToBuffer, targetOf } from './import-target';
import { previewOf, totalsOf, validateRows } from './run-checks';

export const MAX_STORED_ERRORS = 500;

/** The `imports.validate` job: file → parsed rows, errors, preview. */
@Injectable()
export class ImportValidationService {
  private readonly logger = new Logger(ImportValidationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly kinds: ImportKinds,
  ) {}

  async run(importId: string): Promise<void> {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id: importId },
    });
    if (!batch || batch.status !== 'VALIDATING' || !batch.fileId) return;
    try {
      const file = await this.prisma.file.findUniqueOrThrow({
        where: { id: batch.fileId },
      });
      const buffer = await streamToBuffer(
        await this.storage.read(file.storageKey),
      );
      const format = extname(file.originalName).slice(1).toLowerCase();
      const handler = this.kinds.get(batch.kind);
      const grid = await readGrid(buffer, format as ImportFormat);
      const sheet = mapSheet(grid, handler.validator.columns);
      if (sheet.errors.length > 0) {
        await this.finish(importId, sheet.errors, {
          rows: [],
          totals: {
            rows: sheet.rows.length,
            valid: 0,
            invalid: sheet.rows.length,
          },
        });
        return;
      }
      const target = await targetOf(this.prisma, batch, batch.createdById);
      const rows = await validateRows(handler, sheet.rows, this.prisma, target);
      await this.finish(
        importId,
        rows.flatMap((r) => r.errors),
        {
          rows,
          totals: totalsOf(rows),
          preview: previewOf(rows),
        },
      );
    } catch (error) {
      if (error instanceof AppError) {
        await this.finish(
          importId,
          [{ row: 1, column: null, message: error.message }],
          { rows: [], totals: { rows: 0, valid: 0, invalid: 0 } },
        );
        return;
      }
      this.logger.error(`Import ${importId} validation failed`, error);
      await this.prisma.importBatch.update({
        where: { id: importId },
        data: { status: 'FAILED', error: 'The file could not be validated' },
      });
    }
  }

  private async finish(
    importId: string,
    errors: RowError[],
    result: {
      rows: unknown[];
      totals: { rows: number; valid: number; invalid: number };
      preview?: unknown[];
    },
  ): Promise<void> {
    const ok = errors.length === 0 && result.totals.valid > 0;
    await this.prisma.importBatch.updateMany({
      where: { id: importId, status: 'VALIDATING' },
      data: {
        status: ok ? 'READY' : 'INVALID',
        errors: toJson(errors.slice(0, MAX_STORED_ERRORS)),
        totals: result.totals,
        rows: toJson(result.rows),
        preview: toJson(result.preview ?? []),
      },
    });
  }
}
