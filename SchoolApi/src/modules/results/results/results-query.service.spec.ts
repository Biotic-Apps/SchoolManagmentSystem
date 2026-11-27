import { Scope } from '../../../core/rbac/scope/scope';
import { ResultsQueryService } from './results-query.service';

const parent = Scope.createLimited({
  schoolIds: [],
  branchIds: [],
  sectionIds: [],
  memberSchoolIds: ['school-1'],
  memberBranchIds: ['branch-1'],
  studentIds: ['mine'],
  guardian: true,
});

function setup() {
  const read = jest.fn().mockResolvedValue({ id: 'exam-1' });
  const findMany = jest.fn().mockResolvedValue([]);
  const service = new ResultsQueryService(
    { examResult: { findMany } } as never,
    { read, canManage: () => false } as never,
    {} as never,
    { people: jest.fn().mockResolvedValue(new Map()) } as never,
    { forExam: jest.fn().mockResolvedValue(new Map()) } as never,
    {} as never,
  );
  return { service, read, findMany };
}

describe('ResultsQueryService.list parent isolation', () => {
  it("a parent filtering by another family's child gets 404 before anything is read", async () => {
    const { service, read, findMany } = setup();
    await expect(
      service.list(parent, { examId: 'exam-1', studentId: 'someone-else' }),
    ).rejects.toMatchObject({ status: 404 });
    expect(read).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});
