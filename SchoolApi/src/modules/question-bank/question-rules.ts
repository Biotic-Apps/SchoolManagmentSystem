import type { QuestionType } from '../../generated/prisma/client';

export const MCQ_MIN_OPTIONS = 2;
export const MCQ_MAX_OPTIONS = 10;
export const TRUE_FALSE_ANSWERS = ['True', 'False'] as const;

export interface AnswerInput {
  questionType: QuestionType;
  options?: readonly string[] | null;
  correctAnswer: string;
}

export type AnswerCheck =
  | { ok: true; options: string[] | null; correctAnswer: string }
  | { ok: false; field: 'options' | 'correctAnswer'; message: string };

/**
 * Cross-field rules for a question's answer: an MCQ has 2-10 distinct,
 * non-empty options and its answer is one of them (stored with the option's
 * spelling); a True/False answer is "True" or "False" (any casing, stored
 * canonical); other types carry no options.
 */
export function checkAnswer(input: AnswerInput): AnswerCheck {
  const answer = input.correctAnswer.trim();
  if (!answer)
    return {
      ok: false,
      field: 'correctAnswer',
      message: 'Enter the correct answer',
    };
  if (input.questionType === 'MCQ') {
    const options = (input.options ?? []).map((o) => o.trim());
    if (options.some((o) => !o))
      return {
        ok: false,
        field: 'options',
        message: 'Options cannot be blank',
      };
    if (options.length < MCQ_MIN_OPTIONS || options.length > MCQ_MAX_OPTIONS)
      return {
        ok: false,
        field: 'options',
        message: `A multiple choice question needs ${MCQ_MIN_OPTIONS}-${MCQ_MAX_OPTIONS} options`,
      };
    const keys = options.map((o) => o.toLowerCase());
    if (new Set(keys).size !== keys.length)
      return {
        ok: false,
        field: 'options',
        message: 'Options must all be different',
      };
    const index = keys.indexOf(answer.toLowerCase());
    if (index < 0)
      return {
        ok: false,
        field: 'correctAnswer',
        message: 'The correct answer must be one of the options',
      };
    return { ok: true, options, correctAnswer: options[index] };
  }
  if (input.questionType === 'TRUE_FALSE') {
    const match = TRUE_FALSE_ANSWERS.find(
      (a) => a.toLowerCase() === answer.toLowerCase(),
    );
    if (!match)
      return {
        ok: false,
        field: 'correctAnswer',
        message: 'The correct answer must be True or False',
      };
    return { ok: true, options: null, correctAnswer: match };
  }
  return { ok: true, options: null, correctAnswer: answer };
}

export interface SectionMarks {
  questionCount: number;
  marksPerQuestion: number;
}

/** Sum of the section marks (count × marks per question). */
export const sectionsTotal = (sections: readonly SectionMarks[]): number =>
  sections.reduce((sum, s) => sum + s.questionCount * s.marksPerQuestion, 0);

/** "1 mark" / "5 marks". */
export const marksLabel = (marks: number): string =>
  `${marks} ${marks === 1 ? 'mark' : 'marks'}`;

/**
 * Marks printed for each question of a stored section: the section's own
 * per-question marks (older papers stored only the section total).
 */
export const perQuestionMarks = (section: {
  marks: number;
  questionIds: readonly string[];
  marksPerQuestion?: number;
}): number =>
  section.marksPerQuestion ??
  (section.questionIds.length > 0
    ? Math.round((section.marks / section.questionIds.length) * 100) / 100
    : 0);
