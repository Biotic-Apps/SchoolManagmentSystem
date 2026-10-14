import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { StaffAccessService } from '../staff/staff-access.service';
import type {
  CreateHrLetterTemplateDto,
  HrLetterTemplateDto,
  HrLetterTemplateQueryDto,
  UpdateHrLetterTemplateDto,
} from './hr-letter-template.dto';
import type { GenerateHrLetterDto, HrLetterDto } from './hr-letter.dto';

const LETTER_INCLUDE = {
  staff: { select: { id: true, name: true, designation: true } },
} satisfies Prisma.HrLetterInclude;

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class HrLettersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly staffAccess: StaffAccessService,
    private readonly signer: UrlSigner,
    private readonly audit: AuditService,
  ) {}

  // ── Template CRUD ──

  async createTemplate(
    user: AuthUser,
    scope: Scope,
    dto: CreateHrLetterTemplateDto,
  ): Promise<HrLetterTemplateDto> {
    scope.assertManageSchool(dto.schoolId);
    const row = await this.prisma.hrLetterTemplate.create({
      data: {
        schoolId: dto.schoolId,
        type: dto.type,
        title: dto.title.trim(),
        bodyTemplate: dto.bodyTemplate,
        createdById: user.id,
      },
    });
    this.audit.stage({
      action: 'hr_letter_template.create',
      entityType: 'HrLetterTemplate',
      entityId: row.id,
      schoolId: row.schoolId,
      after: { type: row.type, title: row.title },
    });
    return this.mapTemplate(row);
  }

  async listTemplates(
    scope: Scope,
    query: HrLetterTemplateQueryDto,
  ): Promise<PageResult<HrLetterTemplateDto>> {
    scope.assertReadSchool(query.schoolId);
    const where: Prisma.HrLetterTemplateWhereInput = {
      schoolId: query.schoolId,
      type: query.type,
      status: query.status ?? 'ACTIVE',
    };
    const [rows, total] = await Promise.all([
      this.prisma.hrLetterTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.hrLetterTemplate.count({ where }),
    ]);
    return toPageResult(
      rows.map((r) => this.mapTemplate(r)),
      total,
      query,
    );
  }

  async updateTemplate(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateHrLetterTemplateDto,
  ): Promise<HrLetterTemplateDto> {
    const existing = await this.prisma.hrLetterTemplate.findUnique({
      where: { id },
    });
    if (!existing) throw notFound('HR letter template');
    scope.assertManageSchool(existing.schoolId);
    const row = await this.prisma.hrLetterTemplate.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        bodyTemplate: dto.bodyTemplate,
        status: dto.status,
      },
    });
    this.audit.stage({
      action: 'hr_letter_template.update',
      entityType: 'HrLetterTemplate',
      entityId: row.id,
      schoolId: row.schoolId,
      after: { title: row.title, status: row.status },
    });
    return this.mapTemplate(row);
  }

  async deleteTemplate(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<void> {
    const existing = await this.prisma.hrLetterTemplate.findUnique({
      where: { id },
    });
    if (!existing) throw notFound('HR letter template');
    scope.assertManageSchool(existing.schoolId);
    // Soft delete by archiving.
    await this.prisma.hrLetterTemplate.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    this.audit.stage({
      action: 'hr_letter_template.archive',
      entityType: 'HrLetterTemplate',
      entityId: id,
      schoolId: existing.schoolId,
    });
  }

  // ── Letter generation ──

  async generateLetter(
    user: AuthUser,
    scope: Scope,
    staffId: string,
    dto: GenerateHrLetterDto,
  ): Promise<HrLetterDto> {
    const staff = await this.staffAccess.manage(scope, staffId);
    const template = await this.prisma.hrLetterTemplate.findUnique({
      where: { id: dto.templateId },
    });
    if (!template || template.schoolId !== staff.schoolId) {
      throw notFound('HR letter template');
    }
    if (template.status !== 'ACTIVE') {
      throw invalid('Template is archived');
    }

    // Gather placeholder values.
    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: staff.schoolId },
      select: { name: true },
    });
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: staff.branchId },
      select: { name: true },
    });
    const salary = await this.prisma.salaryStructure.findFirst({
      where: { staffId },
      orderBy: { effectiveFrom: 'desc' },
      select: { basicMinor: true, allowances: true },
    });

    const totalSalary = this.computeGrossSalary(salary);
    const effectiveDate = dto.effectiveDate ?? formatDate(new Date());

    const values: Record<string, string> = {
      staffName: staff.name,
      designation: staff.designation,
      joiningDate: formatDate(staff.joinDate),
      salary: totalSalary,
      schoolName: school.name,
      branchName: branch.name,
      today: formatDate(new Date()),
      effectiveDate,
    };

    const body = this.replacePlaceholders(template.bodyTemplate, values);
    const subject = dto.subject?.trim() || `${template.title} - ${staff.name}`;

    const letter = await this.prisma.hrLetter.create({
      data: {
        schoolId: staff.schoolId,
        staffId,
        templateId: template.id,
        type: template.type,
        subject,
        body,
        issuedById: user.id,
      },
      include: LETTER_INCLUDE,
    });

    this.audit.stage({
      action: 'hr_letter.generate',
      entityType: 'HrLetter',
      entityId: letter.id,
      schoolId: letter.schoolId,
      after: { staffId, type: letter.type, subject: letter.subject },
    });

    return this.mapLetter(letter);
  }

  async listLetters(scope: Scope, staffId: string): Promise<HrLetterDto[]> {
    await this.staffAccess.read(scope, staffId);
    const rows = await this.prisma.hrLetter.findMany({
      where: { staffId },
      include: LETTER_INCLUDE,
      orderBy: { issuedAt: 'desc' },
    });
    return rows.map((r) => this.mapLetter(r));
  }

  async getLetter(scope: Scope, id: string): Promise<HrLetterDto> {
    const row = await this.prisma.hrLetter.findUnique({
      where: { id },
      include: LETTER_INCLUDE,
    });
    if (!row) throw notFound('HR letter');
    await this.staffAccess.read(scope, row.staffId);
    return this.mapLetter(row);
  }

  // ── PDF download ──

  async getDownloadUrl(scope: Scope, id: string): Promise<{ fileUrl: string }> {
    const row = await this.prisma.hrLetter.findUnique({
      where: { id },
      select: { staffId: true, fileId: true },
    });
    if (!row) throw notFound('HR letter');
    await this.staffAccess.read(scope, row.staffId);
    if (!row.fileId) throw notFound('HR letter PDF');
    return { fileUrl: this.signer.sign(row.fileId).url };
  }

  // ── Helpers ──

  private replacePlaceholders(
    template: string,
    values: Record<string, string>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      if (key in values) return values[key];
      return match; // Leave unrecognized placeholders as-is.
    });
  }

  private computeGrossSalary(
    salary: { basicMinor: bigint; allowances: unknown } | null,
  ): string {
    if (!salary) return '0';
    let total = Number(salary.basicMinor);
    const allowances = salary.allowances;
    if (Array.isArray(allowances)) {
      for (const a of allowances) {
        if (a && typeof a === 'object' && 'amountMinor' in a) {
          total += Number((a as { amountMinor: unknown }).amountMinor);
        }
      }
    }
    return String(total / 100);
  }

  private mapTemplate(row: {
    id: string;
    schoolId: string;
    type: string;
    title: string;
    bodyTemplate: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): HrLetterTemplateDto {
    return {
      id: row.id,
      schoolId: row.schoolId,
      type: row.type as HrLetterTemplateDto['type'],
      title: row.title,
      bodyTemplate: row.bodyTemplate,
      status: row.status as HrLetterTemplateDto['status'],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapLetter(row: {
    id: string;
    schoolId: string;
    staffId: string;
    templateId: string;
    type: string;
    subject: string;
    body: string;
    fileId: string | null;
    issuedAt: Date;
    createdAt: Date;
    staff: { id: string; name: string; designation: string };
  }): HrLetterDto {
    return {
      id: row.id,
      schoolId: row.schoolId,
      staffId: row.staffId,
      templateId: row.templateId,
      type: row.type as HrLetterDto['type'],
      subject: row.subject,
      body: row.body,
      staff: {
        id: row.staff.id,
        name: row.staff.name,
        designation: row.staff.designation,
      },
      fileUrl: row.fileId ? this.signer.sign(row.fileId).url : null,
      issuedAt: row.issuedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }
}
