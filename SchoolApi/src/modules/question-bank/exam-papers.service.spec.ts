import type { AuthUser } from '../../core/common/types/auth-user';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { Scope } from '../../core/rbac/scope/scope';
import type { GenerateExamPaperDto } from './dto/exam-paper.dto';
import { ExamPapersService } from './exam-papers.service';
import type { QuestionsRepository } from './questions.repository';

const dto: GenerateExamPaperDto = {
  schoolId: 'school-1',
  subjectId: 'subject-1',
  classId: 'class-1',
  title: 'Unit test',
  totalMarks: 50,
  duration: 40,
  sections: [
    {
      title: 'Section A',
      questionCount: 2,
      type: 'MCQ',
      difficulty: 'EASY',
      marksPerQuestion: 1,
    },
  ],
};

interface CreateArgs {
  data: { sections: unknown };
}

function setup() {
  const prisma = {
    generatedPaper: {
      create: jest.fn((args: CreateArgs) =>
        Promise.resolve({
          ...args.data,
          id: 'p-1',
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const repo = {
    randomByFilter: jest.fn().mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]),
  };
  const service = new ExamPapersService(
    prisma as unknown as PrismaService,
    repo as unknown as QuestionsRepository,
  );
  return { service, prisma };
}

const user = { id: 'user-1' } as AuthUser;

describe('ExamPapersService', () => {
  it('refuses a paper whose sections do not add up to the total', async () => {
    const { service, prisma } = setup();
    await expect(
      service.generate(user, Scope.createGlobal(), dto),
    ).rejects.toMatchObject({
      message:
        'Sections add up to 2 marks but the total is 50. Make them equal.',
    });
    expect(prisma.generatedPaper.create).not.toHaveBeenCalled();
  });

  it('stores the marks per question with each section', async () => {
    const { service, prisma } = setup();
    await service.generate(user, Scope.createGlobal(), {
      ...dto,
      totalMarks: 2,
    });
    const created = prisma.generatedPaper.create.mock.calls[0][0];
    expect(created.data.sections).toEqual([
      {
        title: 'Section A',
        questionIds: ['q1', 'q2'],
        marks: 2,
        marksPerQuestion: 1,
      },
    ]);
  });

  it('refuses a new total that no longer matches the stored sections', async () => {
    const { service, prisma } = setup();
    prisma.generatedPaper.findUnique.mockResolvedValue({
      schoolId: 'school-1',
      sections: [{ title: 'A', questionIds: ['q1'], marks: 5 }],
    });
    await expect(
      service.update(Scope.createGlobal(), 'p-1', { totalMarks: 50 }),
    ).rejects.toMatchObject({
      message:
        'Sections add up to 5 marks but the total is 50. Make them equal.',
    });
    expect(prisma.generatedPaper.update).not.toHaveBeenCalled();
  });
});
