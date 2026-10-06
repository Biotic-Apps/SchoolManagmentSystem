import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import type { SyllabusPlanDto, TopicDto } from '../dto/syllabus.dto';
import { isDelayed, summarize } from '../progress-summary';

export const PLAN_INCLUDE = {
  subject: { select: { name: true } },
  chapters: {
    orderBy: { order: 'asc' },
    include: { topics: { orderBy: { order: 'asc' } } },
  },
} satisfies Prisma.SyllabusPlanInclude;

export type PlanRow = Prisma.SyllabusPlanGetPayload<{
  include: typeof PLAN_INCLUDE;
}>;
export type TopicRow = PlanRow['chapters'][number]['topics'][number];

export function toTopicDto(row: TopicRow, today: Date): TopicDto {
  return {
    id: row.id,
    title: row.title,
    order: row.order,
    targetDate: formatDate(row.targetDate),
    status: row.status,
    completedOn: row.completedOn ? formatDate(row.completedOn) : null,
    isDelayed: isDelayed(row, today),
    pendingReview: row.pendingApprovalId !== null,
  };
}

export function toPlanDto(row: PlanRow, today: Date): SyllabusPlanDto {
  return {
    id: row.id,
    sectionId: row.sectionId,
    subjectId: row.subjectId,
    subjectName: row.subject.name,
    sessionId: row.sessionId,
    revision: row.revision,
    status: row.status,
    approvalId: row.approvalRequestId,
    comment: row.comment,
    chapters: row.chapters.map((c) => ({
      id: c.id,
      title: c.title,
      order: c.order,
      topics: c.topics.map((t) => toTopicDto(t, today)),
    })),
    progress: summarize(
      row.chapters.flatMap((c) => c.topics),
      today,
    ),
  };
}
