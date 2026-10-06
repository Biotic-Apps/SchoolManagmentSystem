import { Injectable } from '@nestjs/common';
import type {
  AdmissionEnquiry,
  EnquiryStatus,
  Prisma,
} from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { normalizePhone } from '../../core/auth/identifier';
import { formatDate, parseDate } from '../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
  forbiddenScope,
} from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { ApplicationAccessService } from './application-access.service';
import { ApplicationsService } from './applications.service';
import type { ApplicationDto } from './dto/application.dto';
import type {
  ConvertEnquiryDto,
  CreateEnquiryDto,
  EnquiryDto,
  EnquiryQueryDto,
  UpdateEnquiryDto,
} from './dto/enquiry.dto';

type EnquiryRow = AdmissionEnquiry & { schoolClass: { name: string } };
const INCLUDE = { schoolClass: { select: { name: true } } } as const;

const toDto = (row: EnquiryRow): EnquiryDto => ({
  id: row.id,
  branchId: row.branchId,
  sessionId: row.sessionId,
  classId: row.classId,
  className: row.schoolClass.name,
  childName: row.childName,
  dob: row.dob ? formatDate(row.dob) : null,
  guardianName: row.guardianName,
  phone: row.phone,
  email: row.email,
  source: row.source,
  notes: row.notes,
  followUpDate: row.followUpDate ? formatDate(row.followUpDate) : null,
  status: row.status,
  applicationId: row.applicationId,
  createdAt: row.createdAt.toISOString(),
});

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applications: ApplicationsService,
    private readonly applicationAccess: ApplicationAccessService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: EnquiryQueryDto,
  ): Promise<PageResult<EnquiryDto>> {
    const search = containsInsensitive(query.search);
    const where: Prisma.AdmissionEnquiryWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          status: query.status as EnquiryStatus | undefined,
        },
        search
          ? {
              OR: [
                { childName: search },
                { guardianName: search },
                { phone: search },
              ],
            }
          : {},
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.admissionEnquiry.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.admissionEnquiry.count({ where }),
    ]);
    return toPageResult(rows.map(toDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateEnquiryDto,
  ): Promise<EnquiryDto> {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== dto.branchId)
      throw invalid('Session does not belong to the branch');
    scope.assertManageBranch({
      id: session.branchId,
      schoolId: session.schoolId,
    });
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
    });
    if (!schoolClass || schoolClass.schoolId !== session.schoolId)
      throw invalid('Class does not belong to the school');
    const row = await this.prisma.admissionEnquiry.create({
      data: {
        schoolId: session.schoolId,
        branchId: dto.branchId,
        sessionId: dto.sessionId,
        classId: dto.classId,
        childName: dto.childName.trim(),
        dob: dto.dob ? parseDate(dto.dob) : null,
        guardianName: dto.guardianName.trim(),
        phone: normalizePhone(dto.phone),
        email: dto.email?.toLowerCase(),
        source: dto.source,
        notes: dto.notes,
        followUpDate: dto.followUpDate ? parseDate(dto.followUpDate) : null,
        createdById: user.id,
      },
      include: INCLUDE,
    });
    return this.audited('enquiry.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateEnquiryDto,
  ): Promise<EnquiryDto> {
    const before = await this.load(scope, id);
    if (before.status === 'CONVERTED')
      throw conflict('Enquiry is already converted');
    const row = await this.prisma.admissionEnquiry.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        followUpDate: dto.followUpDate
          ? parseDate(dto.followUpDate)
          : undefined,
        updatedById: user.id,
      },
      include: INCLUDE,
    });
    return this.audited('enquiry.update', before, row);
  }

  async convert(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ConvertEnquiryDto,
  ): Promise<ApplicationDto> {
    const enquiry = await this.load(scope, id);
    if (enquiry.status === 'CONVERTED' || enquiry.status === 'CLOSED')
      throw conflict(`Enquiry is ${enquiry.status.toLowerCase()}`);
    const dob = dto.dob ?? (enquiry.dob ? formatDate(enquiry.dob) : undefined);
    if (!dob) throw invalid('dob is required to convert this enquiry');
    const [firstName, ...rest] = enquiry.childName.split(/\s+/);
    const application = await this.prisma.$transaction(async (tx) => {
      const created = await this.applications.create(
        user,
        scope,
        {
          branchId: enquiry.branchId,
          sessionId: enquiry.sessionId,
          classId: enquiry.classId,
          child: {
            firstName,
            lastName: rest.join(' '),
            dob,
            gender: dto.gender,
          },
          guardians: [
            {
              name: enquiry.guardianName,
              relation: 'GUARDIAN',
              phone: enquiry.phone,
              email: enquiry.email ?? undefined,
              isPrimary: true,
            },
          ],
          notes: enquiry.notes ?? undefined,
        },
        tx,
      );
      await tx.admissionEnquiry.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          applicationId: created.id,
          updatedById: user.id,
        },
      });
      return created;
    });
    this.audit.stage({
      action: 'enquiry.convert',
      entityType: 'AdmissionEnquiry',
      entityId: id,
      schoolId: enquiry.schoolId,
      branchId: enquiry.branchId,
      after: { applicationId: application.id },
    });
    return this.applicationAccess.toDto(application);
  }

  private async load(scope: Scope, id: string): Promise<EnquiryRow> {
    const row = await this.prisma.admissionEnquiry.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!row) throw notFound('Enquiry');
    if (!scope.canManageBranch({ id: row.branchId, schoolId: row.schoolId }))
      throw forbiddenScope();
    return row;
  }

  private audited(
    action: string,
    before: EnquiryRow | undefined,
    after: EnquiryRow,
  ): EnquiryDto {
    const dto = toDto(after);
    this.audit.stage({
      action,
      entityType: 'AdmissionEnquiry',
      entityId: after.id,
      schoolId: after.schoolId,
      branchId: after.branchId,
      before: before && toDto(before),
      after: dto,
    });
    return dto;
  }
}
