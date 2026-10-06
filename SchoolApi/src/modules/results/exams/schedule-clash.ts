export interface SlotPaper {
  examId: string;
  classId: string;
  subjectId: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:mm` */
  startTime: string;
  endTime: string;
  roomId: string | null;
}

export interface ScheduleClash {
  kind: 'CLASS' | 'ROOM';
  date: string;
  first: SlotPaper;
  second: SlotPaper;
}

/** Same date and the time ranges intersect (touching ends do not clash). */
export const overlaps = (a: SlotPaper, b: SlotPaper): boolean =>
  a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime;

function clashOf(a: SlotPaper, b: SlotPaper): ScheduleClash | null {
  if (!overlaps(a, b)) return null;
  if (a.classId === b.classId)
    return { kind: 'CLASS', date: a.date, first: a, second: b };
  if (a.roomId && a.roomId === b.roomId)
    return { kind: 'ROOM', date: a.date, first: a, second: b };
  return null;
}

/**
 * Clashes inside the new schedule and against other exams of the branch:
 * one class sitting two papers at once, or a room booked twice.
 */
export function findClashes(
  papers: readonly SlotPaper[],
  others: readonly SlotPaper[] = [],
): ScheduleClash[] {
  const clashes: ScheduleClash[] = [];
  papers.forEach((paper, i) => {
    for (const other of papers.slice(i + 1)) {
      const clash = clashOf(paper, other);
      if (clash) clashes.push(clash);
    }
    for (const other of others) {
      const clash = clashOf(paper, other);
      if (clash) clashes.push(clash);
    }
  });
  return clashes;
}
