import { Injectable, OnModuleInit } from '@nestjs/common';
import type {
  Prisma,
  ProgressCategory,
  ProgressNote,
} from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import type {
  ApplyContext,
  ProbationActionHandler,
} from '../../../core/probation/probation-action';
import { ProbationActionRegistry } from '../../../core/probation/probation-action.registry';

export const PROGRESS_NOTE_ACTION = 'progress.note';

export interface ProgressNotePayload {
  studentId: string;
  sectionId: string;
  schoolId: string;
  branchId: string;
  category: ProgressCategory;
  note: string;
  visibleToParent: boolean;
  authorId: string;
  onBehalfOfStaffId: string | null;
}

/** Writes a progress note now, or after the probation reviewer approves (P). */
@Injectable()
export class ProgressNoteAction
  implements ProbationActionHandler<ProgressNotePayload>, OnModuleInit
{
  readonly key = PROGRESS_NOTE_ACTION;

  constructor(
    private readonly registry: ProbationActionRegistry,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async apply(
    payload: ProgressNotePayload,
    _context: ApplyContext,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.create(payload, tx);
  }

  async create(
    payload: ProgressNotePayload,
    tx: Prisma.TransactionClient,
  ): Promise<ProgressNote> {
    const note = await tx.progressNote.create({ data: { ...payload } });
    this.audit.stage({
      action: 'progress.note',
      entityType: 'ProgressNote',
      entityId: note.id,
      schoolId: note.schoolId,
      branchId: note.branchId,
      actorId: payload.authorId,
      onBehalfOfStaffId: payload.onBehalfOfStaffId ?? undefined,
      after: {
        studentId: note.studentId,
        category: note.category,
        visibleToParent: note.visibleToParent,
      },
    });
    return note;
  }
}
