import { Injectable } from '@nestjs/common';
import { conflict, notFound } from '../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../core/common/errors/prisma-error.mapper';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { toJson } from '../../../core/common/prisma-json';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  CreateReportCardTemplateDto,
  TemplateQueryDto,
  UpdateReportCardTemplateDto,
} from './dto/template-input.dto';
import type { ReportCardTemplateDto } from './dto/template.dto';

interface TemplateRow {
  id: string;
  schoolId: string;
  branchId: string | null;
  name: string;
  isDefault: boolean;
  layout: unknown;
  header: unknown;
  showGradingScale: boolean;
  showSkills: boolean;
  showRemarks: boolean;
  showAttendance: boolean;
  showPosition: boolean;
  signatures: unknown;
  remarkLabels: unknown;
  footerText: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(row: TemplateRow): ReportCardTemplateDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    branchId: row.branchId,
    name: row.name,
    isDefault: row.isDefault,
    layout: (row.layout ?? {}) as Record<string, unknown>,
    header: (row.header ?? {}) as Record<string, unknown>,
    showGradingScale: row.showGradingScale,
    showSkills: row.showSkills,
    showRemarks: row.showRemarks,
    showAttendance: row.showAttendance,
    showPosition: row.showPosition,
    signatures: (row.signatures ?? []) as string[],
    remarkLabels: (row.remarkLabels as string[] | null) ?? null,
    footerText: row.footerText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** CRUD for report-card layout templates (school or branch level). */
@Injectable()
export class ReportCardTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateReportCardTemplateDto,
  ): Promise<ReportCardTemplateDto> {
    const schoolId = this.resolveSchoolId(scope);

    const row = await this.prisma.$transaction(async (tx) => {
      // If setting as default, unset other defaults for the same branch.
      if (dto.isDefault) {
        await tx.reportCardTemplate.updateMany({
          where: { schoolId, branchId: dto.branchId ?? null, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.reportCardTemplate
        .create({
          data: {
            schoolId,
            branchId: dto.branchId ?? null,
            name: dto.name.trim(),
            isDefault: dto.isDefault ?? false,
            layout: toJson(dto.layout ?? { orientation: 'portrait', paperSize: 'A4' }),
            header: toJson(dto.header ?? { showLogo: true }),
            showGradingScale: dto.showGradingScale ?? true,
            showSkills: dto.showSkills ?? true,
            showRemarks: dto.showRemarks ?? true,
            showAttendance: dto.showAttendance ?? false,
            showPosition: dto.showPosition ?? true,
            signatures: dto.signatures ?? [
              'Class teacher',
              'Principal',
              'Parent / guardian',
            ],
            remarkLabels: dto.remarkLabels ?? undefined,
            footerText: dto.footerText?.trim() ?? null,
            createdById: user.id,
          },
        })
        .catch((error: unknown) => {
          if (isPrismaKnownError(error) && error.code === 'P2002')
            throw conflict(
              'A template with this name already exists for the branch',
            );
          throw error;
        });
    });

    return toDto(row);
  }

  async list(
    scope: Scope,
    query: TemplateQueryDto,
  ): Promise<PageResult<ReportCardTemplateDto>> {
    const where = {
      ...scope.schoolFilter(),
      ...(query.branchId ? { branchId: query.branchId } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.reportCardTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.reportCardTemplate.count({ where }),
    ]);
    return toPageResult(rows.map(toDto), total, query);
  }

  async get(scope: Scope, id: string): Promise<ReportCardTemplateDto> {
    const row = await this.prisma.reportCardTemplate.findUnique({
      where: { id },
    });
    if (!row) throw notFound('Report card template');
    scope.assertReadSchool(row.schoolId);
    return toDto(row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateReportCardTemplateDto,
  ): Promise<ReportCardTemplateDto> {
    const existing = await this.prisma.reportCardTemplate.findUnique({
      where: { id },
    });
    if (!existing) throw notFound('Report card template');
    scope.assertManageSchool(existing.schoolId);

    const row = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.reportCardTemplate.updateMany({
          where: {
            schoolId: existing.schoolId,
            branchId: existing.branchId,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }
      return tx.reportCardTemplate
        .update({
          where: { id },
          data: {
            name: dto.name?.trim(),
            isDefault: dto.isDefault,
            layout: dto.layout ? toJson(dto.layout) : undefined,
            header: dto.header ? toJson(dto.header) : undefined,
            showGradingScale: dto.showGradingScale,
            showSkills: dto.showSkills,
            showRemarks: dto.showRemarks,
            showAttendance: dto.showAttendance,
            showPosition: dto.showPosition,
            signatures: dto.signatures ?? undefined,
            remarkLabels: dto.remarkLabels ?? undefined,
            footerText: dto.footerText !== undefined ? (dto.footerText?.trim() ?? null) : undefined,
          },
        })
        .catch((error: unknown) => {
          if (isPrismaKnownError(error) && error.code === 'P2002')
            throw conflict(
              'A template with this name already exists for the branch',
            );
          throw error;
        });
    });

    return toDto(row);
  }

  async remove(scope: Scope, id: string): Promise<void> {
    const existing = await this.prisma.reportCardTemplate.findUnique({
      where: { id },
    });
    if (!existing) throw notFound('Report card template');
    scope.assertManageSchool(existing.schoolId);

    const used = await this.prisma.reportCard.count({
      where: { templateId: id },
    });
    if (used > 0)
      throw conflict(
        'Template is referenced by existing report cards and cannot be deleted',
      );

    await this.prisma.reportCardTemplate.delete({ where: { id } });
  }

  async setDefault(
    scope: Scope,
    id: string,
  ): Promise<ReportCardTemplateDto> {
    const existing = await this.prisma.reportCardTemplate.findUnique({
      where: { id },
    });
    if (!existing) throw notFound('Report card template');
    scope.assertManageSchool(existing.schoolId);

    const row = await this.prisma.$transaction(async (tx) => {
      await tx.reportCardTemplate.updateMany({
        where: {
          schoolId: existing.schoolId,
          branchId: existing.branchId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
      return tx.reportCardTemplate.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    return toDto(row);
  }

  /** Find the default template for a branch, or school-level default, or null. */
  async resolve(
    schoolId: string,
    branchId: string,
  ): Promise<ReportCardTemplateDto | null> {
    // Try branch-level default first.
    const branch = await this.prisma.reportCardTemplate.findFirst({
      where: { schoolId, branchId, isDefault: true },
    });
    if (branch) return toDto(branch);

    // Fall back to school-level default (branchId is null).
    const school = await this.prisma.reportCardTemplate.findFirst({
      where: { schoolId, branchId: null, isDefault: true },
    });
    return school ? toDto(school) : null;
  }

  private resolveSchoolId(scope: Scope): string {
    if (scope.global) throw conflict('Global scope cannot create templates');
    const ids = [...scope.schoolIds];
    if (ids.length === 0) ids.push(...scope.memberSchoolIds);
    if (ids.length === 0) throw conflict('No school in scope');
    return ids[0];
  }
}
