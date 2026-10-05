import { forbiddenScope } from '../../common/errors/errors';

export interface ScopeIds {
  schoolIds: Iterable<string>;
  branchIds: Iterable<string>;
  sectionIds: Iterable<string>;
  memberSchoolIds: Iterable<string>;
  memberBranchIds: Iterable<string>;
}

export interface BranchRef {
  id: string;
  schoolId: string;
}

const brand: unique symbol = Symbol('Scope');

/**
 * Resolved data scope of the active role. Repositories require one; only
 * ScopeService creates it.
 * - schoolIds/branchIds: full management access.
 * - member*: what the user may read (their own school/branch records).
 */
export class Scope {
  readonly [brand] = true;
  readonly schoolIds: ReadonlySet<string>;
  readonly branchIds: ReadonlySet<string>;
  readonly sectionIds: ReadonlySet<string>;
  readonly memberSchoolIds: ReadonlySet<string>;
  readonly memberBranchIds: ReadonlySet<string>;

  private constructor(
    readonly global: boolean,
    ids: ScopeIds,
  ) {
    this.schoolIds = new Set(ids.schoolIds);
    this.branchIds = new Set(ids.branchIds);
    this.sectionIds = new Set(ids.sectionIds);
    this.memberSchoolIds = new Set(ids.memberSchoolIds);
    this.memberBranchIds = new Set(ids.memberBranchIds);
  }

  static createGlobal(): Scope {
    const none: string[] = [];
    return new Scope(true, {
      schoolIds: none,
      branchIds: none,
      sectionIds: none,
      memberSchoolIds: none,
      memberBranchIds: none,
    });
  }

  static createLimited(ids: ScopeIds): Scope {
    return new Scope(false, ids);
  }

  canReadSchool(schoolId: string): boolean {
    return this.global || this.memberSchoolIds.has(schoolId);
  }

  canManageSchool(schoolId: string): boolean {
    return this.global || this.schoolIds.has(schoolId);
  }

  canReadBranch(branch: BranchRef): boolean {
    return (
      this.global ||
      this.schoolIds.has(branch.schoolId) ||
      this.memberBranchIds.has(branch.id)
    );
  }

  canManageBranch(branch: BranchRef): boolean {
    return (
      this.global ||
      this.schoolIds.has(branch.schoolId) ||
      this.branchIds.has(branch.id)
    );
  }

  assertReadSchool(schoolId: string): void {
    if (!this.canReadSchool(schoolId)) throw forbiddenScope();
  }

  assertManageSchool(schoolId: string): void {
    if (!this.canManageSchool(schoolId)) throw forbiddenScope();
  }

  assertReadBranch(branch: BranchRef): void {
    if (!this.canReadBranch(branch)) throw forbiddenScope();
  }

  assertManageBranch(branch: BranchRef): void {
    if (!this.canManageBranch(branch)) throw forbiddenScope();
  }

  /** Filter for tables with `schoolId`. */
  schoolFilter(): { schoolId?: { in: string[] } } {
    return this.global ? {} : { schoolId: { in: [...this.memberSchoolIds] } };
  }

  /** Filter for tables with `schoolId` + `branchId` (readable branches). */
  branchFilter(): {
    OR?: ({ schoolId: { in: string[] } } | { branchId: { in: string[] } })[];
  } {
    if (this.global) return {};
    return {
      OR: [
        { schoolId: { in: [...this.schoolIds] } },
        { branchId: { in: [...this.memberBranchIds] } },
      ],
    };
  }

  /** Filter for the `branches` table itself. */
  branchTableFilter(): {
    OR?: ({ schoolId: { in: string[] } } | { id: { in: string[] } })[];
  } {
    if (this.global) return {};
    return {
      OR: [
        { schoolId: { in: [...this.schoolIds] } },
        { id: { in: [...this.memberBranchIds] } },
      ],
    };
  }
}
