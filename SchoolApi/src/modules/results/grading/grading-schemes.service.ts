import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { formatHundredths } from '../shared/hundredths';
import { bandProblems } from './grade-bands';
import type {
  CreateGradingSchemeDto,
  GradeBandInputDto,
  GradingSchemeDto,
  GradingSchemeQueryDto,
  UpdateGradingSchemeDto,
} from './dto/grading-scheme.dto';
import {
  SCHEME_INCLUDE,
  toGradingSchemeDto,
  type SchemeRow,
} from './grading.mapper';

const bandRows = (bands: GradeBandInputDto[]) =>
  bands.map((b) => ({
    grade: b.grade.trim(),
    minPercent: b.minPercent,
    maxPercent: b.maxPercent,
    remark: b.remark?.trim() || null,
    gradePoint:
      b.gradePoint === undefined
        ? null
        : formatHundredths(Math.round(b.gradePoint * 100)),
  }));

/** Grading schemes per session (bands 0–100); approved by a second person. */
@Injectable()
export class GradingSchemesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: GradingSchemeQueryDto,
  ): Promise<GradingSchemeDto[]> {
    const rows = await this.prisma.gradingScheme.findMany({
      where: {
        schoolId: query.schoolId,
        sessionId: query.sessionId,
        AND: scope.guardian ? [] : [scope.schoolFilter()],
      },
      include: SCHEME_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return this.toDtos(rows);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateGradingSchemeDto,
  ): Promise<GradingSchemeDto> {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.schoolId !== dto.schoolId)
      throw invalid('Session not found in this school');
    scope.assertManageBranch({
      id: session.branchId,
      schoolId: session.schoolId,
    });
    this.assertBands(dto.bands);
    const row = await this.prisma.gradingScheme
      .create({
        data: {
          schoolId: dto.schoolId,
          sessionId: dto.sessionId,
          name: dto.name.trim(),
          passPercent: dto.passPercent,
          createdById: user.id,
          bands: { create: bandRows(dto.bands) },
        },
        include: SCHEME_INCLUDE,
      })
      .catch((error: unknown) => {
        if (isPrismaKnownError(error) && error.code === 'P2002')
          throw conflict('A scheme with this name exists for the session');
        throw error;
      });
    this.stage('grading.create', row, session.branchId, undefined, dto);
    return (await this.toDtos([row]))[0];
  }

  /** Editing returns the scheme to DRAFT (needs approval again). */
  async update(
    scope: Scope,
    id: string,
    dto: UpdateGradingSchemeDto,
  ): Promise<GradingSchemeDto> {
    const { scheme, branchId } = await this.manage(scope, id);
    const locked = await this.prisma.exam.count({
      where: {
        gradingSchemeId: id,
        status: { in: ['RESULTS_APPROVED', 'PUBLISHED'] },
      },
    });
    if (locked > 0)
      throw conflict('Results using this scheme are already approved');
    if (dto.bands) this.assertBands(dto.bands);
    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.bands) {
        await tx.gradeBand.deleteMany({ where: { schemeId: id } });
        await tx.gradeBand.createMany({
          data: bandRows(dto.bands).map((b) => ({ ...b, schemeId: id })),
        });
      }
      return tx.gradingScheme.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          passPercent: dto.passPercent,
          status: 'DRAFT',
          approvedById: null,
          approvedAt: null,
        },
        include: SCHEME_INCLUDE,
      });
    });
    this.stage('grading.update', row, branchId, scheme, dto);
    return (await this.toDtos([row]))[0];
  }

  async approve(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<GradingSchemeDto> {
    const { scheme, branchId } = await this.manage(scope, id);
    if (scheme.status === 'APPROVED') throw conflict('Already approved');
    if (scheme.createdById === user.id)
      throw forbidden('You cannot approve a scheme you created');
    const row = await this.prisma.gradingScheme.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: user.id,
        approvedAt: new Date(),
      },
      include: SCHEME_INCLUDE,
    });
    this.stage(
      'grading.approve',
      row,
      branchId,
      { status: scheme.status },
      {
        status: 'APPROVED',
      },
    );
    return (await this.toDtos([row]))[0];
  }

  private async manage(scope: Scope, id: string) {
    const scheme = await this.prisma.gradingScheme.findUnique({
      where: { id },
      include: SCHEME_INCLUDE,
    });
    if (!scheme) throw notFound('Grading scheme');
    const session = await this.prisma.academicSession.findUniqueOrThrow({
      where: { id: scheme.sessionId },
    });
    scope.assertManageBranch({
      id: session.branchId,
      schoolId: session.schoolId,
    });
    return { scheme, branchId: session.branchId };
  }

  private assertBands(bands: GradeBandInputDto[]): void {
    const problems = bandProblems(bands);
    if (problems.length > 0) throw invalid('Invalid grade bands', { problems });
  }

  private async toDtos(rows: SchemeRow[]): Promise<GradingSchemeDto[]> {
    const ids = rows.map((r) => r.approvedById).filter((v): v is string => !!v);
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    const names = new Map(users.map((u) => [u.id, u.name]));
    return rows.map((r) =>
      toGradingSchemeDto(
        r,
        r.approvedById ? (names.get(r.approvedById) ?? null) : null,
      ),
    );
  }

  private stage(
    action: string,
    row: SchemeRow,
    branchId: string,
    before: unknown,
    after: unknown,
  ) {
    this.audit.stage({
      action,
      entityType: 'GradingScheme',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId,
      before,
      after,
    });
  }
}
