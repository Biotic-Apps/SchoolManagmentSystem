import type { SchedulePaperDto } from './dto/schedule.dto';

export interface PaperProblem {
  index: number;
  problem: string;
}

export interface PaperContext {
  classIds: ReadonlySet<string>;
  /** `classId:subjectId` of active class subjects. */
  classSubjects: ReadonlySet<string>;
  roomIds: ReadonlySet<string>;
  /** Session range `YYYY-MM-DD`. */
  from: string;
  to: string;
}

export const paperKey = (p: { classId: string; subjectId: string }) =>
  `${p.classId}:${p.subjectId}`;

/** Field-level checks of a schedule (400 details). */
export function paperProblems(
  papers: readonly SchedulePaperDto[],
  context: PaperContext,
): PaperProblem[] {
  const problems: PaperProblem[] = [];
  const seen = new Set<string>();
  papers.forEach((paper, index) => {
    const add = (problem: string) => problems.push({ index, problem });
    const key = paperKey(paper);
    if (seen.has(key)) add('DUPLICATE_PAPER');
    seen.add(key);
    if (!context.classIds.has(paper.classId)) add('CLASS_NOT_IN_EXAM');
    else if (!context.classSubjects.has(key)) add('SUBJECT_NOT_IN_CLASS');
    if (paper.endTime <= paper.startTime) add('END_BEFORE_START');
    if (paper.passMarks > paper.maxMarks) add('PASS_ABOVE_MAX');
    if (paper.date < context.from || paper.date > context.to)
      add('OUTSIDE_SESSION');
    if (paper.roomId && !context.roomIds.has(paper.roomId))
      add('ROOM_NOT_IN_BRANCH');
  });
  return problems;
}
