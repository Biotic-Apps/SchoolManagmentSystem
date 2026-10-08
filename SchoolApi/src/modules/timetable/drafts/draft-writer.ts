import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  Section,
  Timetable,
} from '../../../generated/prisma/client';

type Tx = Prisma.TransactionClient;

const slotKey = (s: {
  day: number;
  periodIndex: number;
  subjectId: string;
  staffId: string;
  roomId: string | null;
}) => `${s.day}:${s.periodIndex}:${s.subjectId}:${s.staffId}:${s.roomId ?? ''}`;

/** Draft lifecycle inside a transaction (contract §5.5 autosave). */
@Injectable()
export class DraftWriter {
  /**
   * The section's timetable ready for draft edits: created when missing; a
   * PUBLISHED one becomes DRAFT_REVISION with draft = published copy.
   */
  async open(tx: Tx, section: Section, userId: string): Promise<Timetable> {
    const timetable = await tx.timetable.upsert({
      where: {
        sectionId_sessionId: {
          sectionId: section.id,
          sessionId: section.sessionId,
        },
      },
      create: {
        schoolId: section.schoolId,
        branchId: section.branchId,
        sessionId: section.sessionId,
        sectionId: section.id,
        updatedById: userId,
      },
      update: { updatedById: userId },
    });
    if (timetable.status !== 'PUBLISHED') return timetable;
    await this.resetDraft(tx, timetable.id);
    return tx.timetable.update({
      where: { id: timetable.id },
      data: { status: 'DRAFT_REVISION' },
    });
  }

  /** Draft := copy of the published slots. */
  async resetDraft(tx: Tx, timetableId: string): Promise<void> {
    await tx.timetableSlot.deleteMany({
      where: { timetableId, published: false },
    });
    const published = await tx.timetableSlot.findMany({
      where: { timetableId, published: true },
    });
    await tx.timetableSlot.createMany({
      data: published.map((slot) => ({
        timetableId: slot.timetableId,
        published: false,
        day: slot.day,
        periodIndex: slot.periodIndex,
        subjectId: slot.subjectId,
        staffId: slot.staffId,
        roomId: slot.roomId,
      })),
    });
  }

  /**
   * After an edit: a never-published draft without lessons disappears (EMPTY);
   * a published timetable whose draft equals the published week is PUBLISHED again.
   */
  async settle(tx: Tx, timetable: Timetable): Promise<Timetable | null> {
    const slots = await tx.timetableSlot.findMany({
      where: { timetableId: timetable.id },
    });
    const drafts = slots.filter((s) => !s.published);
    if (timetable.version === 0) {
      if (drafts.length > 0) return timetable;
      await tx.timetable.delete({ where: { id: timetable.id } });
      return null;
    }
    const published = new Set(slots.filter((s) => s.published).map(slotKey));
    const same =
      drafts.length === published.size &&
      drafts.every((s) => published.has(slotKey(s)));
    const status = same ? 'PUBLISHED' : 'DRAFT_REVISION';
    if (status === timetable.status) return timetable;
    return tx.timetable.update({
      where: { id: timetable.id },
      data: { status },
    });
  }
}
