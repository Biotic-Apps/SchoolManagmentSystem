import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

const SCHOOL_SELECT = {
  id: true,
  name: true,
  status: true,
  logoFileId: true,
  createdAt: true,
} as const;

export type SettingsSchool = Prisma.SchoolGetPayload<{
  select: typeof SCHOOL_SELECT;
}>;

export type SchoolSettingRow = Prisma.SchoolSettingGetPayload<object>;

/** Rows behind school settings and branding (no permission checks). */
@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  school(id: string): Promise<SettingsSchool | null> {
    return this.prisma.school.findUnique({
      where: { id },
      select: SCHOOL_SELECT,
    });
  }

  /** The only active school, else the oldest active one. */
  defaultSchool(): Promise<SettingsSchool | null> {
    return this.prisma.school.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: SCHOOL_SELECT,
    });
  }

  settings(schoolId: string): Promise<SchoolSettingRow | null> {
    return this.prisma.schoolSetting.findUnique({ where: { schoolId } });
  }

  /** Logo that may be served: SCHOOL_LOGO, not archived, not infected. */
  async servableLogo(fileId: string | null): Promise<string | null> {
    if (!fileId) return null;
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        purpose: 'SCHOOL_LOGO',
        archivedAt: null,
        scanStatus: { not: 'INFECTED' },
      },
      select: { id: true },
    });
    return file?.id ?? null;
  }

  upsert(
    schoolId: string,
    data: Omit<Prisma.SchoolSettingUncheckedCreateInput, 'schoolId'>,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<SchoolSettingRow> {
    return db.schoolSetting.upsert({
      where: { schoolId },
      create: { schoolId, ...data },
      update: data,
    });
  }

  /** Settings row and School.logoFileId change together. */
  async saveSchoolSettings(
    schoolId: string,
    data: Omit<Prisma.SchoolSettingUncheckedCreateInput, 'schoolId'>,
    logoFileId: string | null | undefined,
    userId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.schoolSetting.upsert({
        where: { schoolId },
        create: { schoolId, ...data },
        update: data,
      });
      if (logoFileId !== undefined) {
        await tx.school.update({
          where: { id: schoolId },
          data: { logoFileId, updatedById: userId },
        });
      }
    });
  }

  async gradingSchemeExists(schoolId: string, id: string): Promise<boolean> {
    const count = await this.prisma.gradingScheme.count({
      where: { id, schoolId },
    });
    return count > 0;
  }
}
