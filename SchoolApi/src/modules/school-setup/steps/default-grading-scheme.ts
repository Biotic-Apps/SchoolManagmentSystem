import type { PlacedBranch, SetupContext } from './setup-context';

export const DEFAULT_PASS_PERCENT = 40;

/** Usual Pakistani bands: [grade, min %, max %, remark, grade point]. */
export const DEFAULT_BANDS: [string, number, number, string, string][] = [
  ['A+', 90, 100, 'Outstanding', '4.00'],
  ['A', 80, 89, 'Excellent', '3.50'],
  ['B', 70, 79, 'Very good', '3.00'],
  ['C', 60, 69, 'Good', '2.50'],
  ['D', 50, 59, 'Fair', '2.00'],
  ['E', 40, 49, 'Satisfactory', '1.50'],
  ['F', 0, 39, 'Needs improvement', '0.00'],
];

export const defaultSchemeName = (sessionName: string) =>
  `Standard ${sessionName}`;

/**
 * An APPROVED scheme for the new session so exams can be created straight
 * away; the school can edit it (back to DRAFT) or add its own later.
 */
export async function createDefaultGradingScheme(
  ctx: SetupContext,
  branch: PlacedBranch,
  session: { id: string; name: string },
) {
  const scheme = await ctx.tx.gradingScheme.create({
    data: {
      schoolId: branch.schoolId,
      sessionId: session.id,
      name: defaultSchemeName(session.name),
      passPercent: DEFAULT_PASS_PERCENT,
      status: 'APPROVED',
      approvedById: ctx.actorId,
      approvedAt: new Date(),
      createdById: ctx.actorId,
      bands: {
        create: DEFAULT_BANDS.map(
          ([grade, minPercent, maxPercent, remark, gradePoint]) => ({
            grade,
            minPercent,
            maxPercent,
            remark,
            gradePoint,
          }),
        ),
      },
    },
  });
  ctx.audit.push({
    action: 'grading.create',
    entityType: 'GradingScheme',
    entityId: scheme.id,
    schoolId: branch.schoolId,
    branchId: branch.id,
    after: {
      name: scheme.name,
      passPercent: DEFAULT_PASS_PERCENT,
      status: 'APPROVED',
      bands: DEFAULT_BANDS.map(([grade, min, max]) => `${grade} ${min}-${max}`),
    },
  });
  return scheme;
}
