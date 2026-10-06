import { conflict } from '../../../../core/common/errors/errors';
import { isPrismaKnownError } from '../../../../core/common/errors/prisma-error.mapper';

export interface ReferenceIssue {
  entity: string;
  id: string;
  label: string;
  usedBy: string[];
}

/** Collects "still referenced" findings; throws one 409 with all of them. */
export class ReferenceReport {
  private readonly issues = new Map<string, ReferenceIssue>();

  add(entity: string, id: string, label: string, usedBy: string): void {
    const key = `${entity}:${id}`;
    const issue = this.issues.get(key) ?? { entity, id, label, usedBy: [] };
    if (!issue.usedBy.includes(usedBy)) issue.usedBy.push(usedBy);
    this.issues.set(key, issue);
  }

  /** Adds an issue for every listed id. */
  addAll(
    entity: string,
    labels: Map<string, string>,
    usedIds: (string | null)[],
    usedBy: string,
  ): void {
    for (const id of usedIds) {
      if (id) this.add(entity, id, labels.get(id) ?? id, usedBy);
    }
  }

  throwIfAny(): void {
    if (this.issues.size === 0) return;
    const references = [...this.issues.values()].slice(0, 200);
    throw conflict(
      'The import cannot be reverted: some of its records are already in use',
      { references },
    );
  }
}

/** A foreign-key violation during revert also means "in use". */
export function inUseError(error: unknown): unknown {
  if (isPrismaKnownError(error) && error.code === 'P2003') {
    return conflict(
      'The import cannot be reverted: some of its records are already in use',
      { references: [] },
    );
  }
  return error;
}
