import { Injectable } from '@nestjs/common';
import type { ImportKind } from '../../../generated/prisma/client';
import { FeePlanCommitter } from './fee-plans/fee-plan-committer';
import { FeePlanValidator } from './fee-plans/fee-plan-validator';
import { GuardianCommitter } from './guardians/guardian-committer';
import { GuardianValidator } from './guardians/guardian-validator';
import type { KindCommitter, KindValidator } from './kind-handler';
import { OpeningCommitter } from './opening-balances/opening-committer';
import { OpeningValidator } from './opening-balances/opening-validator';
import { StaffCommitter } from './staff/staff-committer';
import { StaffValidator } from './staff/staff-validator';
import { StudentCommitter } from './students/student-committer';
import { StudentValidator } from './students/student-validator';

export interface KindHandler {
  validator: KindValidator<object, unknown>;
  committer: KindCommitter<object, unknown>;
}

export const IMPORT_KIND_PROVIDERS = [
  StudentValidator,
  StudentCommitter,
  GuardianValidator,
  GuardianCommitter,
  StaffValidator,
  StaffCommitter,
  OpeningValidator,
  OpeningCommitter,
  FeePlanValidator,
  FeePlanCommitter,
];

/** Validator + committer per import kind. */
@Injectable()
export class ImportKinds {
  private readonly handlers: Record<ImportKind, KindHandler>;

  constructor(
    students: StudentValidator,
    studentCommitter: StudentCommitter,
    guardians: GuardianValidator,
    guardianCommitter: GuardianCommitter,
    staff: StaffValidator,
    staffCommitter: StaffCommitter,
    opening: OpeningValidator,
    openingCommitter: OpeningCommitter,
    plans: FeePlanValidator,
    planCommitter: FeePlanCommitter,
  ) {
    const pair = (validator: unknown, committer: unknown): KindHandler => ({
      validator: validator as KindHandler['validator'],
      committer: committer as KindHandler['committer'],
    });
    this.handlers = {
      STUDENTS: pair(students, studentCommitter),
      GUARDIANS: pair(guardians, guardianCommitter),
      STAFF: pair(staff, staffCommitter),
      OPENING_BALANCES: pair(opening, openingCommitter),
      FEE_PLANS: pair(plans, planCommitter),
    };
  }

  get(kind: ImportKind): KindHandler {
    return this.handlers[kind];
  }
}
