import { Injectable } from '@nestjs/common';
import type { BookListStatus, Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type {
  BookListDraftDto,
  BookListDto,
  BookListQueryDto,
} from '../dto/book-list.dto';

const INCLUDE = {
  bookList: { include: { schoolClass: { select: { name: true } } } },
  items: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.BookListRevisionInclude;

type RevisionRow = Prisma.BookListRevisionGetPayload<{
  include: typeof INCLUDE;
}>;

const toDto = (row: RevisionRow): BookListDto => ({
  id: row.bookListId,
  branchId: row.bookList.branchId,
  sessionId: row.bookList.sessionId,
  classId: row.bookList.classId,
  className: row.bookList.schoolClass.name,
  revision: row.revision,
  status: row.status,
  items: row.items.map((i) => ({
    id: i.id,
    subjectId: i.subjectId,
    title: i.title,
    author: i.author,
    publisher: i.publisher,
    isbn: i.isbn,
    isMandatory: i.isMandatory,
    priceMinor: i.priceMinor === null ? null : Number(i.priceMinor),
  })),
  approvedAt: row.approvedAt?.toISOString() ?? null,
  comment: row.comment,
});

/** Class book lists with revisions; an approved change notifies guardians. */
@Injectable()
export class BookListsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    query: BookListQueryDto,
  ): Promise<BookListDto[]> {
    const editor =
      user.permissions.has('syllabus.edit') ||
      user.permissions.has('syllabus.approve');
    const where: Prisma.BookListWhereInput = {
      AND: [
        scope.guardian ? await this.childClasses(scope) : scope.branchFilter(),
        {
          branchId: query.branchId,
          sessionId: query.sessionId,
          classId: query.classId,
        },
      ],
    };
    const lists = await this.prisma.bookList.findMany({
      where,
      select: { id: true },
    });
    const out: BookListDto[] = [];
    for (const list of lists) {
      const row = await this.latest(
        list.id,
        editor && !scope.guardian ? undefined : 'APPROVED',
      );
      if (row) out.push(toDto(row));
    }
    return out;
  }

  async revisions(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<BookListDto[]> {
    const list = await this.prisma.bookList.findUnique({ where: { id } });
    if (!list) throw notFound('Book list');
    if (
      scope.guardian ||
      !scope.canReadBranch({ id: list.branchId, schoolId: list.schoolId })
    )
      throw forbiddenScope();
    const rows = await this.prisma.bookListRevision.findMany({
      where: { bookListId: id },
      include: INCLUDE,
      orderBy: { revision: 'desc' },
    });
    return rows.map(toDto);
  }

  async saveDraft(
    user: AuthUser,
    scope: Scope,
    classId: string,
    dto: BookListDraftDto,
  ) {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== dto.branchId)
      throw invalid('Session does not belong to the branch');
    scope.assertManageBranch({ id: dto.branchId, schoolId: session.schoolId });
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!schoolClass || schoolClass.schoolId !== session.schoolId)
      throw invalid('Class not found');

    const revisionId = await this.prisma.$transaction(async (tx) => {
      const list = await tx.bookList.upsert({
        where: {
          branchId_sessionId_classId: {
            branchId: dto.branchId,
            sessionId: dto.sessionId,
            classId,
          },
        },
        create: {
          schoolId: session.schoolId,
          branchId: dto.branchId,
          sessionId: dto.sessionId,
          classId,
        },
        update: {},
      });
      const last = await tx.bookListRevision.findFirst({
        where: { bookListId: list.id },
        orderBy: { revision: 'desc' },
      });
      if (last?.status === 'SUBMITTED')
        throw conflict('The list is awaiting approval');
      const revision =
        last && last.status !== 'APPROVED'
          ? last
          : await tx.bookListRevision.create({
              data: {
                bookListId: list.id,
                revision: (last?.revision ?? 0) + 1,
                createdById: user.id,
              },
            });
      await tx.bookListItem.deleteMany({ where: { revisionId: revision.id } });
      await tx.bookListItem.createMany({
        data: dto.items.map((item, index) => ({
          revisionId: revision.id,
          subjectId: item.subjectId,
          title: item.title.trim(),
          author: item.author,
          publisher: item.publisher,
          isbn: item.isbn,
          isMandatory: item.isMandatory,
          priceMinor: item.priceMinor,
          sortOrder: index + 1,
        })),
      });
      await tx.bookListRevision.update({
        where: { id: revision.id },
        data: { status: 'DRAFT', comment: null },
      });
      return revision.id;
    });
    return this.done(
      'book_list.draft',
      revisionId,
      session.schoolId,
      dto.branchId,
    );
  }

  async submit(user: AuthUser, scope: Scope, id: string, comment?: string) {
    return this.transition(scope, id, ['DRAFT', 'RETURNED'], 'SUBMITTED', {
      submittedById: user.id,
      submittedAt: new Date(),
      comment,
    });
  }

  async approve(user: AuthUser, scope: Scope, id: string, comment?: string) {
    const dto = await this.transition(scope, id, ['SUBMITTED'], 'APPROVED', {
      decidedById: user.id,
      approvedAt: new Date(),
      comment,
    });
    await this.notifyGuardians(dto);
    return dto;
  }

  async returnList(user: AuthUser, scope: Scope, id: string, comment?: string) {
    return this.transition(scope, id, ['SUBMITTED'], 'RETURNED', {
      decidedById: user.id,
      comment,
    });
  }

  private async transition(
    scope: Scope,
    id: string,
    from: BookListStatus[],
    to: BookListStatus,
    data: Prisma.BookListRevisionUncheckedUpdateInput,
  ): Promise<BookListDto> {
    const list = await this.prisma.bookList.findUnique({ where: { id } });
    if (!list) throw notFound('Book list');
    scope.assertManageBranch({ id: list.branchId, schoolId: list.schoolId });
    const last = await this.latest(id);
    if (!last || !from.includes(last.status))
      throw conflict(`Book list is ${last?.status ?? 'empty'}`);
    await this.prisma.bookListRevision.update({
      where: { id: last.id },
      data: { ...data, status: to },
    });
    return this.done(
      `book_list.${to.toLowerCase()}`,
      last.id,
      list.schoolId,
      list.branchId,
    );
  }

  private async done(
    action: string,
    revisionId: string,
    schoolId: string,
    branchId: string,
  ) {
    const row = await this.prisma.bookListRevision.findUniqueOrThrow({
      where: { id: revisionId },
      include: INCLUDE,
    });
    const dto = toDto(row);
    this.audit.stage({
      action,
      entityType: 'BookList',
      entityId: row.bookListId,
      schoolId,
      branchId,
      after: dto,
    });
    return dto;
  }

  private latest(bookListId: string, status?: BookListStatus) {
    return this.prisma.bookListRevision.findFirst({
      where: { bookListId, status },
      include: INCLUDE,
      orderBy: { revision: 'desc' },
    });
  }

  private async childClasses(scope: Scope): Promise<Prisma.BookListWhereInput> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: { in: [...scope.studentIds] }, status: 'ACTIVE' },
      select: { sessionId: true, section: { select: { classId: true } } },
    });
    return {
      OR: enrollments.map((e) => ({
        sessionId: e.sessionId,
        classId: e.section.classId,
      })),
    };
  }

  private async notifyGuardians(dto: BookListDto): Promise<void> {
    const guardians = await this.prisma.guardian.findMany({
      where: {
        userId: { not: null },
        studentLinks: {
          some: {
            status: 'VERIFIED',
            student: {
              enrollments: {
                some: {
                  status: 'ACTIVE',
                  sessionId: dto.sessionId,
                  section: { classId: dto.classId },
                },
              },
            },
          },
        },
      },
      select: { userId: true },
    });
    await this.notifications.notify({
      userIds: guardians.map((g) => g.userId!),
      category: 'SYLLABUS',
      title: 'Book list updated',
      body: `The ${dto.className} book list (revision ${dto.revision}) is now approved.`,
      data: { bookListId: dto.id },
    });
  }
}
