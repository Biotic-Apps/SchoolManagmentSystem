import { Injectable } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import {
  conflict,
  forbidden,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import { ProbationGate } from '../../../core/probation/probation-gate';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  TopicProgressDto,
  TopicProgressResultDto,
} from '../dto/syllabus.dto';
import { toTopicDto } from '../plans/plan.mapper';
import {
  TopicProgressAction,
  TOPIC_PROGRESS_ACTION,
  type TopicProgressPayload,
} from './topic-progress.action';

/**
 * Assigned teacher marks progress (P); helpers cannot; supervisors with
 * `teacherwork.proxy` act on behalf of the subject teacher.
 */
@Injectable()
export class TopicProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gate: ProbationGate,
    private readonly action: TopicProgressAction,
  ) {}

  async update(
    user: AuthUser,
    scope: Scope,
    topicId: string,
    dto: TopicProgressDto,
  ): Promise<TopicProgressResultDto> {
    if (user.activeRole === String(RoleKey.HELPER))
      throw forbidden('Helpers cannot update progress');
    const topic = await this.prisma.syllabusTopic.findUnique({
      where: { id: topicId },
      include: { plan: { include: { subject: { select: { name: true } } } } },
    });
    if (!topic) throw notFound('Topic');
    const plan = topic.plan;
    if (plan.status !== 'APPROVED')
      throw conflict('The syllabus plan is not approved');
    if (topic.pendingApprovalId)
      throw conflict('A change to this topic is awaiting review');

    const onBehalfOfStaffId = await this.actorFor(user, scope, plan);
    const payload: TopicProgressPayload = {
      topicId,
      status: dto.status,
      completedOn:
        dto.status === 'COMPLETED'
          ? (dto.completedOn ?? formatDate(today()))
          : null,
      note: dto.note ?? null,
    };
    const result = await this.gate.run(
      { userId: user.id, onBehalfOfStaffId },
      {
        key: TOPIC_PROGRESS_ACTION,
        entityType: 'SyllabusTopic',
        entityId: topicId,
        schoolId: plan.schoolId,
        branchId: plan.branchId,
        title: `${plan.subject.name}: "${topic.title}" -> ${dto.status}`,
        payload,
      },
      () =>
        this.prisma.$transaction((tx) =>
          this.action.apply(
            payload,
            { performedById: user.id, onBehalfOfStaffId },
            tx,
          ),
        ),
    );
    const row = await this.prisma.syllabusTopic.findUniqueOrThrow({
      where: { id: topicId },
    });
    return {
      status: result.status,
      approvalId: result.approvalId,
      topic: toTopicDto(row, today()),
    };
  }

  /** null = own work; a staff id = supervisor proxy for that teacher. */
  private async actorFor(
    user: AuthUser,
    scope: Scope,
    plan: {
      sectionId: string;
      subjectId: string;
      branchId: string;
      schoolId: string;
    },
  ): Promise<string | null> {
    if (scope.canTeach(plan.sectionId, plan.subjectId)) return null;
    const section = {
      id: plan.sectionId,
      branchId: plan.branchId,
      schoolId: plan.schoolId,
    };
    if (
      !user.permissions.has('teacherwork.proxy') ||
      !scope.canReadSection(section)
    )
      throw forbiddenScope('You do not teach this subject in this section');
    const teacher = await this.prisma.staffAssignment.findFirst({
      where: {
        sectionId: plan.sectionId,
        subjectId: plan.subjectId,
        kind: 'SUBJECT_TEACHER',
        endedAt: null,
      },
      orderBy: { isSubstitute: 'asc' },
    });
    return teacher?.staffId ?? null;
  }
}
