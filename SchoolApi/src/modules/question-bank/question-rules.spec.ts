import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import {
  checkAnswer,
  marksLabel,
  perQuestionMarks,
  sectionsTotal,
} from './question-rules';

const base = {
  schoolId: '01a21d46-0000-7000-8000-000000000001',
  subjectId: '01a21d46-0000-7000-8000-000000000002',
  classId: '01a21d46-0000-7000-8000-000000000003',
  chapterName: 'Numbers',
  questionType: 'SHORT',
  difficultyLevel: 'EASY',
  marks: 1,
  questionText: 'What is 2 + 3?',
  correctAnswer: '5',
};

const errorsOf = (plain: object) =>
  validateSync(plainToInstance(CreateQuestionDto, plain)).map(
    (e) => e.property,
  );

describe('CreateQuestionDto', () => {
  it('rejects whitespace-only text, chapter and answer', () => {
    expect(
      errorsOf({
        ...base,
        questionText: '   ',
        chapterName: ' ',
        correctAnswer: '\t',
      }).sort(),
    ).toEqual(['chapterName', 'correctAnswer', 'questionText']);
  });

  it('trims real values', () => {
    const dto = plainToInstance(CreateQuestionDto, {
      ...base,
      questionText: '  What is 2 + 3? ',
      options: [' 4 ', '5 '],
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.questionText).toBe('What is 2 + 3?');
    expect(dto.options).toEqual(['4', '5']);
  });

  it('bounds the options list and option length', () => {
    expect(
      errorsOf({ ...base, options: Array.from({ length: 300 }, String) }),
    ).toEqual(['options']);
    expect(errorsOf({ ...base, options: ['a', 'x'.repeat(501)] })).toEqual([
      'options',
    ]);
  });

  it('rejects whitespace-only text on update too', () => {
    const dto = plainToInstance(UpdateQuestionDto, { questionText: '  ' });
    expect(validateSync(dto).map((e) => e.property)).toEqual(['questionText']);
  });
});

describe('checkAnswer', () => {
  it('needs at least two MCQ options', () => {
    expect(
      checkAnswer({ questionType: 'MCQ', options: [], correctAnswer: '1' }),
    ).toMatchObject({ ok: false, field: 'options' });
    expect(
      checkAnswer({
        questionType: 'MCQ',
        options: undefined,
        correctAnswer: '1',
      }),
    ).toMatchObject({ ok: false, field: 'options' });
  });

  it('refuses blank or duplicate MCQ options', () => {
    expect(
      checkAnswer({
        questionType: 'MCQ',
        options: ['a', ' '],
        correctAnswer: 'a',
      }),
    ).toMatchObject({ ok: false, field: 'options' });
    expect(
      checkAnswer({
        questionType: 'MCQ',
        options: ['a', 'A'],
        correctAnswer: 'a',
      }),
    ).toMatchObject({ ok: false, message: 'Options must all be different' });
  });

  it('needs the MCQ answer to be one of the options', () => {
    expect(
      checkAnswer({
        questionType: 'MCQ',
        options: ['1', '2'],
        correctAnswer: '9',
      }),
    ).toMatchObject({ ok: false, field: 'correctAnswer' });
    expect(
      checkAnswer({
        questionType: 'MCQ',
        options: ['Paris', 'Rome'],
        correctAnswer: ' paris ',
      }),
    ).toEqual({ ok: true, options: ['Paris', 'Rome'], correctAnswer: 'Paris' });
  });

  it('accepts only True or False for TRUE_FALSE and drops options', () => {
    expect(
      checkAnswer({
        questionType: 'TRUE_FALSE',
        options: null,
        correctAnswer: 'banana',
      }),
    ).toMatchObject({ ok: false, field: 'correctAnswer' });
    expect(
      checkAnswer({
        questionType: 'TRUE_FALSE',
        options: ['x', 'y'],
        correctAnswer: 'false',
      }),
    ).toEqual({ ok: true, options: null, correctAnswer: 'False' });
  });

  it('stores no options for other types', () => {
    expect(
      checkAnswer({
        questionType: 'SHORT',
        options: ['a'],
        correctAnswer: ' 5 ',
      }),
    ).toEqual({ ok: true, options: null, correctAnswer: '5' });
  });
});

describe('paper marks', () => {
  it('sums section marks', () => {
    expect(
      sectionsTotal([
        { questionCount: 5, marksPerQuestion: 1 },
        { questionCount: 3, marksPerQuestion: 5 },
      ]),
    ).toBe(20);
  });

  it('prints the section marks per question, also for older papers', () => {
    expect(
      perQuestionMarks({ marks: 5, questionIds: ['a'], marksPerQuestion: 5 }),
    ).toBe(5);
    expect(perQuestionMarks({ marks: 10, questionIds: ['a', 'b'] })).toBe(5);
    expect(perQuestionMarks({ marks: 0, questionIds: [] })).toBe(0);
  });

  it('pluralises marks', () => {
    expect(marksLabel(1)).toBe('1 mark');
    expect(marksLabel(5)).toBe('5 marks');
  });
});
