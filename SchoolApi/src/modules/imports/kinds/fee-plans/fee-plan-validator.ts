import { Injectable } from '@nestjs/common';
import type { FeeFrequency } from '../../../../generated/prisma/client';
import {
  parseAmount,
  parseEnum,
  parseInteger,
  parseText,
} from '../../validation/fields';
import {
  addError,
  flagDuplicates,
  RowBuilder,
  type ColumnSpec,
  type ParsedRow,
  type SheetRow,
} from '../../validation/sheet';
import type { Db, ImportTarget, KindValidator } from '../kind-handler';
import { classKey } from '../shared/academic-refs';

const FREQUENCIES: FeeFrequency[] = [
  'MONTHLY',
  'QUARTERLY',
  'TERM',
  'YEARLY',
  'ONCE',
];

export const FEE_PLAN_COLUMNS: ColumnSpec[] = [
  {
    key: 'class',
    header: 'Class',
    required: true,
    format: 'Class name as set up, e.g. "Class 5" or 5',
    example: 'Class 5',
  },
  {
    key: 'planName',
    header: 'Plan name',
    required: true,
    format:
      'Text (max 100); rows with the same class and plan name form one plan',
    example: 'Class 5 2026-27',
  },
  {
    key: 'feeHeadCode',
    header: 'Fee head code',
    required: true,
    format: 'Code of an existing fee head, e.g. TUITION (once per plan)',
    example: 'TUITION',
  },
  {
    key: 'amount',
    header: 'Amount',
    required: true,
    format: 'Rupees, up to 2 decimals, greater than 0',
    example: '4500',
  },
  {
    key: 'frequency',
    header: 'Frequency',
    required: true,
    format: FREQUENCIES.join(', '),
    example: 'MONTHLY',
  },
  {
    key: 'dueDay',
    header: 'Due day',
    required: true,
    format: 'Day of the month 1-31 (clamped to short months)',
    example: '10',
  },
];

export interface FeePlanImportRow {
  className?: string;
  planName?: string;
  feeHeadCode?: string;
  amountMinor?: number;
  frequency?: FeeFrequency;
  dueDay?: number;
  classId?: string;
  feeHeadId?: string;
}

export interface FeePlanContext {
  classes: Map<string, string>;
  heads: Map<string, string>;
  /** `${classId}|${lower(name)}` of plans in the session */
  plans: Set<string>;
}

export const planKey = (classId: string, name: string) =>
  `${classId}|${name.toLowerCase()}`;

@Injectable()
export class FeePlanValidator implements KindValidator<
  FeePlanImportRow,
  FeePlanContext
> {
  readonly kind = 'FEE_PLANS' as const;
  readonly columns = FEE_PLAN_COLUMNS;
  readonly notes = [
    'Plans are created as DRAFT for the branch and session chosen on upload; they bill only after approval.',
    'A class may not already have a plan with the same name in the session.',
  ];

  parse(source: SheetRow): ParsedRow<FeePlanImportRow> {
    const r = new RowBuilder(source, this.columns);
    return r.done({
      className: r.need('class', (v) => parseText(v, 50)),
      planName: r.need('planName', (v) => parseText(v, 100)),
      feeHeadCode: r
        .need('feeHeadCode', (v) => parseText(v, 30))
        ?.toUpperCase(),
      amountMinor: r.need('amount', parseAmount),
      frequency: r.need('frequency', (v) => parseEnum(v, FREQUENCIES)),
      dueDay: r.need('dueDay', (v) => parseInteger(v, 1, 31)),
    });
  }

  async loadContext(db: Db, target: ImportTarget): Promise<FeePlanContext> {
    const [classes, heads, plans] = await Promise.all([
      db.schoolClass.findMany({
        where: { schoolId: target.schoolId, status: 'ACTIVE' },
        select: { id: true, name: true },
      }),
      db.feeHead.findMany({
        where: { schoolId: target.schoolId, status: 'ACTIVE', system: false },
        select: { id: true, code: true },
      }),
      db.feePlan.findMany({
        where: { sessionId: target.sessionId },
        select: { classId: true, name: true },
      }),
    ]);
    return {
      classes: new Map(classes.map((c) => [classKey(c.name), c.id])),
      heads: new Map(heads.map((h) => [h.code.toUpperCase(), h.id])),
      plans: new Set(plans.map((p) => planKey(p.classId, p.name))),
    };
  }

  check(rows: ParsedRow<FeePlanImportRow>[], ctx: FeePlanContext): void {
    for (const row of rows) {
      const d = row.data;
      if (d.className) {
        d.classId = ctx.classes.get(classKey(d.className));
        if (!d.classId)
          addError(row, 'Class', `Unknown class "${d.className}"`);
      }
      if (d.feeHeadCode) {
        d.feeHeadId = ctx.heads.get(d.feeHeadCode);
        if (!d.feeHeadId)
          addError(row, 'Fee head code', `Unknown fee head "${d.feeHeadCode}"`);
      }
      if (
        d.classId &&
        d.planName &&
        ctx.plans.has(planKey(d.classId, d.planName))
      ) {
        addError(
          row,
          'Plan name',
          'The class already has a plan with this name in the session',
        );
      }
    }
    flagDuplicates(
      rows,
      (d) =>
        d.classId && d.planName && d.feeHeadId
          ? `${planKey(d.classId, d.planName)}|${d.feeHeadId}`
          : null,
      'Fee head code',
      'fee head in this plan',
    );
  }
}
