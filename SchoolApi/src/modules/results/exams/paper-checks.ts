import type { SchedulePaperDto } from './dto/schedule.dto';

export interface PaperProblem {
  index: number;
  problem: string;
  /** Human text for problems that need context (holiday name, hours). */
  message?: string;
}

export interface OffDay {
  /** `YYYY-MM-DD` inclusive range. */
  from: string;
  to: string;
  title: string;
  type: 'HOLIDAY' | 'VACATION';
}

export interface PaperContext {
  classIds: ReadonlySet<string>;
  /** `classId:subjectId` of active class subjects. */
  classSubjects: ReadonlySet<string>;
  roomIds: ReadonlySet<string>;
  /** Session range `YYYY-MM-DD`. */
  from: string;
  to: string;
  /** ISO weekdays 1=Mon..7=Sun the branch works (omit to skip). */
  workingDays?: ReadonlySet<number>;
  /** Active holidays and vacations of the branch/school. */
  offDays?: readonly OffDay[];
  /** Branch school hours `HH:mm` (omit to skip). */
  opensAt?: string;
  closesAt?: string;
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** ISO weekday (1=Mon..7=Sun) of a `YYYY-MM-DD` date. */
export const weekdayOf = (date: string): number => {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
};

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

/** `2026-12-25` → `25-Dec-2026`. */
export const displayDate = (date: string): string => {
  const [y, m, d] = date.split('-');
  return `${d}-${MONTHS[Number(m) - 1]}-${y}`;
};

/** Calendar checks for one paper: working day, holiday/vacation, school hours. */
function calendarProblems(
  paper: Pick<SchedulePaperDto, 'date' | 'startTime' | 'endTime'>,
  context: PaperContext,
): Omit<PaperProblem, 'index'>[] {
  const out: Omit<PaperProblem, 'index'>[] = [];
  const weekday = weekdayOf(paper.date);
  if (context.workingDays && !context.workingDays.has(weekday))
    out.push({
      problem: 'NON_WORKING_DAY',
      message: `${WEEKDAYS[weekday - 1]} is not a working day for this branch`,
    });
  const off = context.offDays?.find(
    (d) => d.from <= paper.date && d.to >= paper.date,
  );
  if (off)
    out.push({
      problem: off.type === 'VACATION' ? 'VACATION' : 'HOLIDAY',
      message: `${displayDate(paper.date)} falls on ${off.title} (${off.type === 'VACATION' ? 'vacation' : 'holiday'})`,
    });
  if (
    context.opensAt &&
    context.closesAt &&
    (paper.startTime < context.opensAt || paper.endTime > context.closesAt)
  )
    out.push({
      problem: 'OUTSIDE_SCHOOL_HOURS',
      message: `Times must be within school hours ${context.opensAt}–${context.closesAt}`,
    });
  return out;
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
    for (const p of calendarProblems(paper, context))
      problems.push({ index, ...p });
  });
  return problems;
}

const PROBLEM_TEXT: Record<string, string> = {
  DUPLICATE_PAPER: 'The subject is listed twice',
  CLASS_NOT_IN_EXAM: 'The class is not part of this exam',
  SUBJECT_NOT_IN_CLASS: 'The subject is not taught in this class',
  END_BEFORE_START: 'End time must be after the start time',
  PASS_ABOVE_MAX: 'Pass marks cannot exceed max marks',
  OUTSIDE_SESSION: 'The date is outside the academic session',
  ROOM_NOT_IN_BRANCH: 'The room is not in this branch',
};

/** Human text of a problem (its own message, else the code's text). */
export const problemText = (p: PaperProblem): string =>
  p.message ?? PROBLEM_TEXT[p.problem] ?? p.problem;

/** Top-level 400 message: the first problem, with its row number. */
export const problemsMessage = (problems: readonly PaperProblem[]): string => {
  const first = problems[0];
  const more = problems.length > 1 ? ` (and ${problems.length - 1} more)` : '';
  return `Paper ${first.index + 1}: ${problemText(first)}${more}`;
};
