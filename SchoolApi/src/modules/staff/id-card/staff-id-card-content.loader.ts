import type { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { StaffIdCardContent } from './staff-id-card-pdf';

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks);
}

/** What an ID card prints for a staff member (current placement and photo). */
@Injectable()
export class StaffIdCardContentLoader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  async load(
    staffId: string,
    version: number | null,
  ): Promise<StaffIdCardContent> {
    const staff = await this.prisma.staff.findUniqueOrThrow({
      where: { id: staffId },
      include: {
        school: { select: { name: true } },
        branch: { select: { name: true, phone: true } },
        photoFile: { select: { storageKey: true, mime: true } },
      },
    });
    const photo =
      staff.photoFile && PHOTO_TYPES.has(staff.photoFile.mime)
        ? await readAll(await this.storage.read(staff.photoFile.storageKey))
        : null;
    return {
      schoolName: staff.school.name,
      branchName: staff.branch.name,
      branchContact: staff.branch.phone ?? null,
      staffName: staff.name,
      employeeNo: staff.employeeNo ?? '',
      designation: staff.designation,
      publicId: staff.id,
      version,
      photo,
      phone: staff.phone ?? null,
      email: staff.email ?? null,
    };
  }
}
