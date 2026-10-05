import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { invalid } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { AssignmentInputDto } from './dto/assignment-input.dto';
import type { GrantTarget } from './grant-rules';

export interface ResolvedAssignment {
  target: Omit<GrantTarget, 'targetUserId'>;
  data: Omit<Prisma.RoleAssignmentUncheckedCreateInput, 'userId'>;
}

/** Validates scope fields and fills school/branch from the narrowest given id. */
@Injectable()
export class AssignmentResolver {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(
    input: AssignmentInputDto,
    grantedById: string,
  ): Promise<ResolvedAssignment> {
    const place = await this.place(input);
    const role = await this.prisma.role.findFirst({
      where: {
        key: input.roleKey,
        status: 'ACTIVE',
        OR: [
          { schoolId: null },
          ...(place.schoolId ? [{ schoolId: place.schoolId }] : []),
        ],
      },
    });
    if (!role) throw invalid(`Unknown role ${input.roleKey}`);
    const validUntil = input.validUntil ? new Date(input.validUntil) : null;
    if (validUntil && validUntil <= new Date())
      throw invalid('validUntil must be in the future');

    return {
      target: {
        roleKey: role.key,
        roleSchoolId: role.schoolId,
        scopeType: input.scopeType,
        schoolId: place.schoolId,
        branchId: place.branchId,
      },
      data: {
        roleId: role.id,
        scopeType: input.scopeType,
        ...place,
        validFrom: new Date(),
        validUntil,
        grantedById,
      },
    };
  }

  private async place(input: AssignmentInputDto) {
    const empty = {
      schoolId: null as string | null,
      branchId: null as string | null,
      sectionId: null as string | null,
      subjectId: null as string | null,
    };
    switch (input.scopeType) {
      case 'GLOBAL':
        return empty;
      case 'SCHOOL':
        if (!input.schoolId)
          throw invalid('schoolId is required for SCHOOL scope');
        await this.prisma.school
          .findUniqueOrThrow({ where: { id: input.schoolId } })
          .catch(() => {
            throw invalid('School does not exist');
          });
        return { ...empty, schoolId: input.schoolId };
      case 'SECTION':
      case 'SUBJECT_SECTION':
        return this.fromSection(input);
      default:
        if (input.branchId)
          return { ...empty, ...(await this.fromBranch(input.branchId)) };
        if (input.schoolId) return { ...empty, schoolId: input.schoolId };
        if (input.scopeType === 'BRANCH')
          throw invalid('branchId is required for BRANCH scope');
        return empty;
    }
  }

  private async fromBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw invalid('Branch does not exist');
    return { schoolId: branch.schoolId, branchId: branch.id };
  }

  private async fromSection(input: AssignmentInputDto) {
    if (!input.sectionId)
      throw invalid('sectionId is required for section scopes');
    if (input.scopeType === 'SUBJECT_SECTION' && !input.subjectId) {
      throw invalid('subjectId is required for SUBJECT_SECTION scope');
    }
    const section = await this.prisma.section.findUnique({
      where: { id: input.sectionId },
    });
    if (!section) throw invalid('Section does not exist');
    return {
      schoolId: section.schoolId,
      branchId: section.branchId,
      sectionId: section.id,
      subjectId:
        input.scopeType === 'SUBJECT_SECTION'
          ? (input.subjectId ?? null)
          : null,
    };
  }
}
