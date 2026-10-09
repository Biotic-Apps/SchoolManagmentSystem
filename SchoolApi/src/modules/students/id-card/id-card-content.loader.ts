import type { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../student.mapper';
import { currentEnrollment } from '../student-scope';
import type { IdCardContent } from './id-card-pdf';

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks);
}

/** What an ID card prints for a student (current placement and photo). */
@Injectable()
export class IdCardContentLoader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  async load(
    studentId: string,
    version: number | null,
  ): Promise<IdCardContent> {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: studentId },
      include: {
        school: { select: { name: true } },
        photoFile: { select: { storageKey: true, mime: true } },
        enrollments: {
          include: {
            branch: { select: { name: true, phone: true } },
            section: {
              select: { name: true, schoolClass: { select: { name: true } } },
            },
          },
          orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
    const enrollment = currentEnrollment(student.enrollments);
    const photo =
      student.photoFile && PHOTO_TYPES.has(student.photoFile.mime)
        ? await readAll(await this.storage.read(student.photoFile.storageKey))
        : null;
    return {
      schoolName: student.school.name,
      branchName: enrollment?.branch.name ?? '',
      branchContact: enrollment?.branch.phone ?? null,
      studentName: fullName(student),
      admissionNo: student.admissionNo,
      classLabel: enrollment
        ? `${enrollment.section.schoolClass.name} - ${enrollment.section.name}`
        : '',
      publicId: student.id,
      version,
      photo,
    };
  }
}
