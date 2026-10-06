import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { StorageDriver } from '../../core/files/storage/storage-driver';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { RenderedReport } from './render/render-report';

/** Stores a rendered report as a REPORT file owned by the requester. */
@Injectable()
export class ReportFileWriter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  async save(input: {
    taskId: string;
    schoolId: string;
    ownerId: string;
    baseName: string;
    report: RenderedReport;
  }): Promise<string> {
    const { report } = input;
    const storageKey = `reports/${new Date().getUTCFullYear()}/${input.taskId}.${report.extension}`;
    await this.storage.put(storageKey, report.buffer, report.mime);
    const file = await this.prisma.file.create({
      data: {
        schoolId: input.schoolId,
        purpose: 'REPORT',
        storageKey,
        originalName: `${input.baseName}.${report.extension}`,
        mime: report.mime,
        size: report.buffer.length,
        sha256: createHash('sha256').update(report.buffer).digest('hex'),
        uploadedById: input.ownerId,
        scanStatus: 'CLEAN',
      },
    });
    return file.id;
  }
}
