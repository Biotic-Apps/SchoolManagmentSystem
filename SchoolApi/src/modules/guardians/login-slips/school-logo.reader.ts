import type { Readable } from 'node:stream';
import { Injectable, Logger } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';

const LOGO_TYPES = new Set(['image/png', 'image/jpeg']);

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks);
}

/** The school's logo for printed slips (PNG/JPEG only; null when missing or unreadable). */
@Injectable()
export class SchoolLogoReader {
  private readonly logger = new Logger(SchoolLogoReader.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  async read(schoolId: string): Promise<Buffer | null> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        logoFile: {
          select: { storageKey: true, mime: true, archivedAt: true },
        },
      },
    });
    const file = school?.logoFile;
    if (!file || file.archivedAt || !LOGO_TYPES.has(file.mime)) return null;
    try {
      return await readAll(await this.storage.read(file.storageKey));
    } catch (error) {
      this.logger.warn(`School logo unreadable: ${String(error)}`);
      return null;
    }
  }
}
