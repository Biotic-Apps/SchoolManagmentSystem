import type { AuthUser } from '../../core/common/types/auth-user';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { Scope } from '../../core/rbac/scope/scope';
import type { CreateQuestionDto } from './dto/question.dto';
import type { QuestionsRepository } from './questions.repository';
import { QuestionsService } from './questions.service';

const dto: CreateQuestionDto = {
  schoolId: 'school-1',
  subjectId: 'subject-1',
  classId: 'class-1',
  chapterName: ' ch 1 ',
  questionType: 'SHORT',
  difficultyLevel: 'EASY',
  marks: 50,
  questionText: 'What is an atom?',
  correctAnswer: 'The smallest unit of matter',
};

function setup() {
  const prisma = {
    subject: {
      findUnique: jest.fn().mockResolvedValue({ schoolId: 'school-1' }),
    },
    schoolClass: {
      findUnique: jest.fn().mockResolvedValue({ schoolId: 'school-1' }),
    },
  };
  const repository = {
    create: jest.fn((data: Record<string, unknown>) =>
      Promise.resolve({
        ...data,
        id: 'q-1',
        options: null,
        status: 'ACTIVE',
        createdAt: new Date('2026-10-15T00:00:00.000Z'),
        updatedAt: new Date('2026-10-15T00:00:00.000Z'),
      }),
    ),
  };
  const service = new QuestionsService(
    prisma as unknown as PrismaService,
    repository as unknown as QuestionsRepository,
  );
  return { service, repository };
}

const user = { id: 'user-1' } as AuthUser;

describe('QuestionsService.create', () => {
  it('lets a global (all schools) super admin add a question', async () => {
    const { service, repository } = setup();
    const result = await service.create(user, Scope.createGlobal(), dto);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ schoolId: 'school-1', chapterName: 'ch 1' }),
    );
    expect(result.id).toBe('q-1');
  });

  it('rejects a school outside a limited scope', async () => {
    const { service } = setup();
    const scope = Scope.createLimited({
      schoolIds: ['other-school'],
      branchIds: [],
      sectionIds: [],
      memberSchoolIds: ['other-school'],
      memberBranchIds: [],
    });
    await expect(service.create(user, scope, dto)).rejects.toMatchObject({
      message: 'School not in your scope',
    });
  });
});
