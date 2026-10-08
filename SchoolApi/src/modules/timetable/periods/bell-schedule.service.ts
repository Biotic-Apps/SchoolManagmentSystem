import { Injectable } from '@nestjs/common';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { BellPlanInput } from '../dto/bell-plan.input';
import type { BellScheduleDto } from '../dto/bell-schedule.dto';
import type { SetBellScheduleDto } from '../dto/timetable-input.dto';
import { generateBellSchedule } from './bell-generator';
import { numberPeriods } from './bell-schedule';
import { parseDayRows } from './day-rows.parser';
import { PeriodsService } from './periods.service';

/** GET/PUT /branches/:id/bell-schedule and the generator preview (contract §5.4). */
@Injectable()
export class BellScheduleService {
  constructor(private readonly periods: PeriodsService) {}

  async get(scope: Scope, branchId: string): Promise<BellScheduleDto> {
    const branch = await this.periods.branch(branchId);
    if (!scope.guardian) scope.assertReadBranch(branch);
    return {
      workingDays: branch.workingDays,
      ...(await this.periods.schedule(branchId)),
    };
  }

  async replace(
    scope: Scope,
    branchId: string,
    dto: SetBellScheduleDto,
  ): Promise<BellScheduleDto> {
    const days = parseDayRows(dto.days);
    await this.periods.write(scope, branchId, {
      days: new Map([[0, dto.default], ...days]),
      replaceAll: true,
      dropLessons: dto.dropLessons ?? false,
    });
    return this.get(scope, branchId);
  }

  /** Preview only; nothing is saved. */
  async generate(
    scope: Scope,
    branchId: string,
    plan: BellPlanInput,
  ): Promise<BellScheduleDto> {
    const branch = await this.periods.branch(branchId);
    scope.assertManageBranch(branch);
    const generated = generateBellSchedule(plan, branch.workingDays);
    return {
      workingDays: branch.workingDays,
      default: numberPeriods(generated.default),
      days: Object.fromEntries(
        Object.entries(generated.days).map(([day, rows]) => [
          day,
          numberPeriods(rows),
        ]),
      ),
    };
  }
}
