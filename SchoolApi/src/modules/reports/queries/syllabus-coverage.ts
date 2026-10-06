import { percent } from '../report-table';
import { branchName, str, type ReportQuery } from './report-query';

export const syllabusCoverage: ReportQuery = async ({
  prisma,
  params,
  today,
}) => {
  const branchId = str(params, 'branchId');
  const session = params.sessionId
    ? await prisma.academicSession.findFirst({
        where: { id: str(params, 'sessionId'), branchId },
      })
    : await prisma.academicSession.findFirst({
        where: { branchId, status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
      });
  const plans = session
    ? await prisma.syllabusPlan.findMany({
        where: { branchId, sessionId: session.id },
        select: {
          status: true,
          section: {
            select: {
              name: true,
              schoolClass: { select: { name: true, levelOrder: true } },
            },
          },
          subject: { select: { name: true } },
          topics: { select: { status: true, targetDate: true } },
        },
      })
    : [];
  const rows = plans
    .sort(
      (a, b) =>
        a.section.schoolClass.levelOrder - b.section.schoolClass.levelOrder ||
        a.section.name.localeCompare(b.section.name) ||
        a.subject.name.localeCompare(b.subject.name),
    )
    .map((plan) => {
      const done = plan.topics.filter((t) => t.status === 'COMPLETED').length;
      return {
        className: plan.section.schoolClass.name,
        sectionName: plan.section.name,
        subject: plan.subject.name,
        planStatus: plan.status,
        topics: plan.topics.length,
        completed: done,
        inProgress: plan.topics.filter((t) => t.status === 'IN_PROGRESS')
          .length,
        behind: plan.topics.filter(
          (t) => t.status !== 'COMPLETED' && t.targetDate < today,
        ).length,
        coverage: percent(done, plan.topics.length),
      };
    });
  return {
    title: `Syllabus coverage — ${await branchName(prisma, branchId)} — ${session?.name ?? 'no session'}`,
    columns: [
      { key: 'className', header: 'Class' },
      { key: 'sectionName', header: 'Section' },
      { key: 'subject', header: 'Subject' },
      { key: 'planStatus', header: 'Plan status' },
      { key: 'topics', header: 'Topics', kind: 'int' },
      { key: 'completed', header: 'Completed', kind: 'int' },
      { key: 'inProgress', header: 'In progress', kind: 'int' },
      { key: 'behind', header: 'Behind schedule', kind: 'int' },
      { key: 'coverage', header: 'Coverage %', kind: 'percent' },
    ],
    rows,
  };
};
