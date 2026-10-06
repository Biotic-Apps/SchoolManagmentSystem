import { createHash } from 'node:crypto';
import type { Readable } from 'node:stream';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../student.mapper';
import { currentEnrollment } from '../student-scope';
import { ID_CARD_JOB, type IdCardJobInput } from './id-card-job';
import { renderIdCard } from './id-card-pdf';

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks);
}

/** Renders the ID card PDF into file storage and marks the card READY. */
@Injectable()
export class IdCardProcessor
  implements JobProcessor<IdCardJobInput>, OnModuleInit
{
  readonly queue = QUEUES.DOCUMENTS;
  readonly name = ID_CARD_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: IdCardJobInput): Promise<void> {
    try {
      await this.render(input.idCardId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.prisma.idCard.update({
        where: { id: input.idCardId },
        data: { status: 'FAILED', error: message.slice(0, 500) },
      });
      throw error;
    }
  }

  private async render(idCardId: string): Promise<void> {
    const card = await this.prisma.idCard.findUniqueOrThrow({
      where: { id: idCardId },
      include: {
        school: { select: { name: true } },
        student: {
          include: {
            photoFile: { select: { storageKey: true, mime: true } },
            enrollments: {
              include: {
                branch: { select: { name: true, phone: true } },
                section: {
                  select: {
                    name: true,
                    schoolClass: { select: { name: true } },
                  },
                },
              },
              orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
            },
          },
        },
      },
    });
    const student = card.student;
    const enrollment = currentEnrollment(student.enrollments);
    const photo =
      student.photoFile && PHOTO_TYPES.has(student.photoFile.mime)
        ? await readAll(await this.storage.read(student.photoFile.storageKey))
        : null;
    const pdf = await renderIdCard({
      schoolName: card.school.name,
      branchName: enrollment?.branch.name ?? '',
      branchContact: enrollment?.branch.phone ?? null,
      studentName: fullName(student),
      admissionNo: student.admissionNo,
      classLabel: enrollment
        ? `${enrollment.section.schoolClass.name} - ${enrollment.section.name}`
        : '',
      publicId: student.id,
      version: card.version,
      photo,
    });

    const now = new Date();
    const storageKey = `id-cards/${now.getUTCFullYear()}/${card.id}.pdf`;
    await this.storage.put(storageKey, pdf, 'application/pdf');
    await this.prisma.$transaction(async (tx) => {
      const file = await tx.file.create({
        data: {
          schoolId: card.schoolId,
          purpose: 'ID_CARD',
          storageKey,
          originalName: `id-card-${student.admissionNo}-v${card.version}.pdf`,
          mime: 'application/pdf',
          size: pdf.length,
          sha256: createHash('sha256').update(pdf).digest('hex'),
          uploadedById: card.requestedById,
          scanStatus: 'CLEAN',
        },
      });
      await tx.idCard.update({
        where: { id: card.id },
        data: {
          status: 'READY',
          fileId: file.id,
          generatedAt: now,
          error: null,
        },
      });
    });
  }
}
