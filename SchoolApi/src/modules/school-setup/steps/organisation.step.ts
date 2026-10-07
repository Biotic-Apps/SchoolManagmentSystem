import { Injectable } from '@nestjs/common';
import { toJson } from '../../../core/common/prisma-json';
import { toBranchDto } from '../../branches/branch.mapper';
import { BranchesRepository } from '../../branches/branches.repository';
import { BranchSettingsRepository } from '../../branches/settings/branch-settings.repository';
import { SettingsRepository } from '../../settings/settings.repository';
import { SCHOOL_SETTING_DEFAULTS } from '../../settings/school-settings.mapper';
import { SchoolsRepository } from '../../schools/schools.repository';
import type { SchoolSetupDto } from '../dto/school-setup.dto';
import { SETUP_DEFAULTS } from '../presets';
import { onUnique, schoolCodeTaken } from '../setup-errors';
import type { SetupContext } from './setup-context';

/** School + its settings row, main branch + its settings (contract §1 items 1–2). */
@Injectable()
export class OrganisationStep {
  constructor(
    private readonly schools: SchoolsRepository,
    private readonly settings: SettingsRepository,
    private readonly branches: BranchesRepository,
    private readonly branchSettings: BranchSettingsRepository,
  ) {}

  async run(ctx: SetupContext, dto: SchoolSetupDto) {
    const school = await this.schools
      .create({ ...dto.school, createdById: ctx.actorId }, ctx.tx)
      .catch(onUnique(() => schoolCodeTaken(dto.school.code)));
    await this.settings.upsert(
      school.id,
      { ...SCHOOL_SETTING_DEFAULTS, updatedById: ctx.actorId },
      ctx.tx,
    );
    ctx.audit.push({
      action: 'school.create',
      entityType: 'School',
      entityId: school.id,
      schoolId: school.id,
      after: { id: school.id, code: school.code, name: school.name },
    });

    const input = dto.branch ?? {};
    const timings = input.timings ?? SETUP_DEFAULTS.timings;
    const branch = await this.branches.create(
      {
        schoolId: school.id,
        code: input.code ?? SETUP_DEFAULTS.branchCode,
        name: input.name?.trim() || SETUP_DEFAULTS.branchName,
        address: input.address,
        phone: input.phone,
        email: input.email,
        timings: toJson(timings),
        workingDays: input.workingDays ?? [...SETUP_DEFAULTS.workingDays],
        createdById: ctx.actorId,
      },
      ctx.tx,
    );
    // The attendance lock job reads this setting; keep it equal to the form's timing.
    await this.branchSettings.save(
      branch.id,
      { 'attendance.lockTime': timings.attendanceLockAt },
      ctx.actorId,
      ctx.tx,
    );
    ctx.audit.push({
      action: 'branch.create',
      entityType: 'Branch',
      entityId: branch.id,
      schoolId: school.id,
      branchId: branch.id,
      after: toBranchDto(branch),
    });
    return { school, branch };
  }
}
