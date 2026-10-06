import { Injectable } from '@nestjs/common';
import type { ParsedRow } from '../../validation/sheet';
import {
  ids,
  type CommitResult,
  type Db,
  type ImportTarget,
  type KindCommitter,
} from '../kind-handler';
import { ReferenceReport } from '../shared/references';
import {
  planKey,
  type FeePlanContext,
  type FeePlanImportRow,
} from './fee-plan-validator';

/** FEE_PLANS: one DRAFT plan per class + plan name with its items. */
@Injectable()
export class FeePlanCommitter implements KindCommitter<
  FeePlanImportRow,
  FeePlanContext
> {
  readonly kind = 'FEE_PLANS' as const;

  async commit(
    tx: Db,
    target: ImportTarget,
    rows: ParsedRow<FeePlanImportRow>[],
  ): Promise<CommitResult> {
    const groups = new Map<string, FeePlanImportRow[]>();
    for (const { data } of rows) {
      const key = planKey(data.classId!, data.planName!);
      groups.set(key, [...(groups.get(key) ?? []), data]);
    }
    const plans: string[] = [];
    for (const items of groups.values()) {
      const plan = await tx.feePlan.create({
        data: {
          schoolId: target.schoolId,
          branchId: target.branchId,
          sessionId: target.sessionId,
          classId: items[0].classId!,
          name: items[0].planName!,
          createdById: target.actorId,
          items: {
            create: items.map((item) => ({
              feeHeadId: item.feeHeadId!,
              amountMinor: BigInt(item.amountMinor!),
              frequency: item.frequency!,
              dueDay: item.dueDay!,
            })),
          },
        },
      });
      plans.push(plan.id);
    }
    return {
      created: { plans },
      reconciliation: { created: rows.length, plans: plans.length },
    };
  }

  /** Only plans still in their imported DRAFT state with no invoices. */
  async revert(
    tx: Db,
    _target: ImportTarget,
    created: Record<string, unknown>,
  ): Promise<{ userIds?: string[] }> {
    const planIds = ids(created, 'plans');
    const plans = await tx.feePlan.findMany({
      where: { id: { in: planIds } },
      select: {
        id: true,
        name: true,
        status: true,
        revision: true,
        approvedAt: true,
      },
    });
    const invoiced = await tx.invoice.findMany({
      where: { planId: { in: planIds } },
      select: { planId: true },
      distinct: ['planId'],
    });
    const report = new ReferenceReport();
    const labels = new Map(plans.map((p) => [p.id, p.name]));
    for (const plan of plans) {
      if (plan.status !== 'DRAFT' || plan.revision > 1 || plan.approvedAt) {
        report.add('FeePlan', plan.id, plan.name, 'edited or approved');
      }
    }
    report.addAll(
      'FeePlan',
      labels,
      invoiced.map((i) => i.planId),
      'invoices',
    );
    report.throwIfAny();
    await tx.feePlan.deleteMany({ where: { id: { in: planIds } } });
    return {};
  }
}
