import { Injectable } from '@nestjs/common';
import type { Term } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { assertDateRange } from '../../../core/common/validation/date-range';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { CreateTermDto } from '../dto/create-term.dto';
import type { TermDto } from '../dto/term.dto';
import type { UpdateTermDto } from '../dto/update-term.dto';
import { assertSessionOpen } from '../session-lock';
import { SessionsService } from '../sessions.service';
import type { SessionRow } from '../sessions.repository';
import { toTermDto } from './term.mapper';
import { TermsRepository } from './terms.repository';

@Injectable()
export class TermsService {
  constructor(
    private readonly sessions: SessionsService,
    private readonly repository: TermsRepository,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, sessionId: string): Promise<TermDto[]> {
    await this.sessions.find(scope, sessionId);
    return (await this.repository.listBySession(sessionId)).map(toTermDto);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    sessionId: string,
    dto: CreateTermDto,
  ): Promise<TermDto> {
    const session = await this.sessions.managed(scope, sessionId);
    assertSessionOpen(session);
    const start = parseDate(dto.startDate);
    const end = parseDate(dto.endDate);
    await this.assertFits(session, start, end);
    const term = await this.repository
      .create({
        schoolId: session.schoolId,
        branchId: session.branchId,
        sessionId,
        name: dto.name.trim(),
        sortOrder: await this.repository.nextSortOrder(sessionId),
        startDate: start,
        endDate: end,
        createdById: user.id,
      })
      .catch((error: { code?: string }) => {
        if (error.code === 'P2002')
          throw conflict(`Term ${dto.name} already exists`);
        throw error;
      });
    return this.audited('term.create', undefined, term);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateTermDto,
  ): Promise<TermDto> {
    const { term, session } = await this.managed(scope, id);
    const start = dto.startDate ? parseDate(dto.startDate) : term.startDate;
    const end = dto.endDate ? parseDate(dto.endDate) : term.endDate;
    await this.assertFits(session, start, end, id);
    const updated = await this.repository.update(id, {
      name: dto.name?.trim(),
      startDate: start,
      endDate: end,
      updatedById: user.id,
    });
    return this.audited('term.update', term, updated);
  }

  async remove(scope: Scope, id: string): Promise<void> {
    const { term } = await this.managed(scope, id);
    await this.repository.delete(id);
    this.audited('term.delete', term, undefined);
  }

  private async managed(scope: Scope, id: string) {
    const term = await this.repository.findById(id);
    if (!term) throw notFound('Term');
    const session = await this.sessions.managed(scope, term.sessionId);
    assertSessionOpen(session);
    return { term, session };
  }

  /** Inside the session dates and not overlapping another term. */
  private async assertFits(
    session: SessionRow,
    start: Date,
    end: Date,
    exceptId?: string,
  ) {
    assertDateRange(start, end);
    if (start < session.startDate || end > session.endDate) {
      throw invalid('Term must fall within the session dates');
    }
    if (await this.repository.overlapping(session.id, start, end, exceptId)) {
      throw conflict('Term overlaps another term');
    }
  }

  private audited(
    action: string,
    before: Term | undefined,
    after: Term | undefined,
  ): TermDto {
    const ref = (after ?? before) as Term;
    this.audit.stage({
      action,
      entityType: 'Term',
      entityId: ref.id,
      schoolId: ref.schoolId,
      branchId: ref.branchId,
      before: before && toTermDto(before),
      after: after && toTermDto(after),
    });
    return toTermDto(ref);
  }
}
