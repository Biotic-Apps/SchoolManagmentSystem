import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { FilePurpose } from '../../../generated/prisma/client';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';

/** Stores a bulk-print PDF as a file owned by the requester. */
@Injectable()
export class PrintFileWriter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  async save(input: {
    taskId: string;
    schoolId: string;
    ownerId: string;
    purpose: FilePurpose;
    fileName: string;
    buffer: Buffer;
  }): Promise<string> {
    const storageKey = `prints/${new Date().getUTCFullYear()}/${input.taskId}.pdf`;
    await this.storage.put(storageKey, input.buffer, 'application/pdf');
    const file = await this.prisma.file.create({
      data: {
        schoolId: input.schoolId,
        purpose: input.purpose,
        storageKey,
        originalName: input.fileName,
        mime: 'application/pdf',
        size: input.buffer.length,
        sha256: createHash('sha256').update(input.buffer).digest('hex'),
        uploadedById: input.ownerId,
        scanStatus: 'CLEAN',
      },
    });
    return file.id;
  }
}
