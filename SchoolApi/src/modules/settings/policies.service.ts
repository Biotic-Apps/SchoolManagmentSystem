import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { Scope } from '../../core/rbac/scope/scope';
import type { SchoolPolicies } from '../../core/school-settings/school-policies';
import { SchoolSettingsReader } from '../../core/school-settings/school-settings.reader';
import type { UpdatePoliciesDto } from './dto/policies.dto';
import { approvalLimitsProblem, mergePolicies } from './policies.rules';
import { editableSchool, readableSchool } from './settings-access';
import { SettingsRepository } from './settings.repository';

@Injectable()
export class PoliciesService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly reader: SchoolSettingsReader,
    private readonly audit: AuditService,
  ) {}

  async get(scope: Scope, schoolId: string): Promise<SchoolPolicies> {
    await readableSchool(this.repository, scope, schoolId);
    return this.reader.policies(schoolId);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    schoolId: string,
    dto: UpdatePoliciesDto,
  ): Promise<SchoolPolicies> {
    await editableSchool(this.repository, user, scope, schoolId);
    if (dto.approvalLimits !== undefined) {
      const problem = approvalLimitsProblem(dto.approvalLimits);
      if (problem) throw invalid(problem);
    }
    if (
      dto.gradingDefault &&
      !(await this.repository.gradingSchemeExists(schoolId, dto.gradingDefault))
    ) {
      throw invalid('gradingDefault must be a grading scheme of this school');
    }
    await this.reader.invalidate(schoolId);
    const before = await this.reader.policies(schoolId);
    const next = mergePolicies(before, dto);
    await this.repository.upsert(schoolId, {
      policies: toJson(next),
      updatedById: user.id,
    });
    await this.reader.invalidate(schoolId);
    this.audit.stage({
      action: 'settings.policies.update',
      entityType: 'SchoolSetting',
      entityId: schoolId,
      schoolId,
      before,
      after: next,
    });
    return next;
  }
}
