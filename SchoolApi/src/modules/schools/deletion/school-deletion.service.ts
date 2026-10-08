import { Injectable } from '@nestjs/common';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import {
  conflict,
  forbidden,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { JobDispatcher } from '../../../core/jobs/job-dispatcher';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { summarize, totalRows } from './deletion-summary';
import type {
  SchoolDeletionPreviewDto,
  SchoolDeletionStatusDto,
} from './dto/school-deletion.dto';
import {
  DELETE_SCHOOL_JOB,
  type DeleteSchoolInput,
} from './school-deletion.processor';
import { SchoolPurgeService } from './school-purge.service';

/** Preview, request and follow a permanent school deletion (super admin only). */
@Injectable()
export class SchoolDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purge: SchoolPurgeService,
    private readonly jobs: JobDispatcher,
  ) {}

  async preview(
    user: AuthUser,
    schoolId: string,
  ): Promise<SchoolDeletionPreviewDto> {
    assertSuperAdmin(user);
    const school = await this.find(schoolId);
    const counts = await this.purge.preview(schoolId);
    const otherActive = await this.prisma.school.count({
      where: { status: 'ACTIVE', id: { not: schoolId } },
    });
    return {
      schoolId,
      code: school.code,
      name: school.name,
      status: school.status,
      lastActiveSchool: otherActive === 0,
      summary: summarize(counts),
      removedUsers: counts.removedUsers,
      keptUsers: counts.keptUsers,
      totalRows: totalRows(counts),
      tables: counts.tables,
    };
  }

  async request(
    user: AuthUser,
    schoolId: string,
    confirmCode: string,
  ): Promise<SchoolDeletionStatusDto> {
    assertSuperAdmin(user);
    const school = await this.find(schoolId);
    if (confirmCode.trim() !== school.code) {
      throw new AppError(
        ErrorCode.CONFIRM_CODE_MISMATCH,
        `Type the school code ${school.code} to confirm`,
      );
    }
    if ((await this.lastRun(schoolId))?.status === 'RUNNING') {
      throw conflict('This school is already being deleted');
    }
    const input: DeleteSchoolInput = { schoolId, actorId: user.id };
    await this.jobs.dispatch(QUEUES.MAINTENANCE, DELETE_SCHOOL_JOB, input);
    return { schoolId, state: 'RUNNING', error: null };
  }

  async status(
    user: AuthUser,
    schoolId: string,
  ): Promise<SchoolDeletionStatusDto> {
    assertSuperAdmin(user);
    const exists = await this.prisma.school.count({ where: { id: schoolId } });
    const run = await this.lastRun(schoolId);
    if (!exists) {
      if (!run) throw notFound('School');
      return { schoolId, state: 'DELETED', error: null };
    }
    if (!run || run.status === 'COMPLETED') {
      return { schoolId, state: 'IDLE', error: null };
    }
    return {
      schoolId,
      state: run.status === 'FAILED' ? 'FAILED' : 'RUNNING',
      error: run.error,
    };
  }

  private lastRun(schoolId: string) {
    return this.prisma.jobRun.findFirst({
      where: {
        queue: QUEUES.MAINTENANCE,
        name: DELETE_SCHOOL_JOB,
        data: { path: ['schoolId'], equals: schoolId },
      },
      orderBy: { startedAt: 'desc' },
      select: { status: true, error: true },
    });
  }

  private async find(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw notFound('School');
    return school;
  }
}

function assertSuperAdmin(user: AuthUser): void {
  if (user.activeRole !== (RoleKey.SUPER_ADMIN as string)) {
    throw forbidden('Only a super admin can delete a school');
  }
}
