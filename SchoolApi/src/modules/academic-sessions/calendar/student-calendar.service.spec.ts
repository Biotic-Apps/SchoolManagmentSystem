import { notFound } from '../../../core/common/errors/errors';
import { Scope } from '../../../core/rbac/scope/scope';
import type { StudentAccessService } from '../../students/student-access.service';
import type { CalendarRepository } from './calendar.repository';
import { StudentCalendarService } from './student-calendar.service';

const scope = Scope.createGlobal();
const event = {
  id: 'evt-1',
  schoolId: 'school',
  branchId: null,
  type: 'HOLIDAY',
  title: 'Quaid Day',
  startDate: new Date('2026-12-25T00:00:00.000Z'),
  endDate: new Date('2026-12-25T00:00:00.000Z'),
  description: null,
};

function setup(enrollments: object[], read?: jest.Mock) {
  const students = {
    read: read ?? jest.fn().mockResolvedValue({ id: 'student-1', enrollments }),
  };
  const repository = { listForBranch: jest.fn().mockResolvedValue([event]) };
  const service = new StudentCalendarService(
    students as unknown as StudentAccessService,
    repository as unknown as CalendarRepository,
  );
  return { service, students, repository };
}

describe('StudentCalendarService', () => {
  it('lists events of the current enrollment branch', async () => {
    const { service, repository } = setup([
      { status: 'ACTIVE', branchId: 'b-now', schoolId: 'school' },
      { status: 'PROMOTED', branchId: 'b-old', schoolId: 'school' },
    ]);
    const result = await service.list(scope, 'student-1', {
      from: '2026-12-01',
      to: '2026-12-31',
    });
    expect(repository.listForBranch).toHaveBeenCalledWith(
      { id: 'b-now', schoolId: 'school' },
      new Date('2026-12-01T00:00:00.000Z'),
      new Date('2026-12-31T00:00:00.000Z'),
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: 'evt-1',
        branchId: null,
        startDate: '2026-12-25',
        endDate: '2026-12-25',
      }),
    ]);
  });

  it('returns nothing for a student without enrollments', async () => {
    const { service, repository } = setup([]);
    await expect(service.list(scope, 'student-1', {})).resolves.toEqual([]);
    expect(repository.listForBranch).not.toHaveBeenCalled();
  });

  it('passes the access check result through (404 for other children)', async () => {
    const read = jest.fn().mockRejectedValue(notFound('Student'));
    const { service, repository } = setup([], read);
    await expect(service.list(scope, 'other', {})).rejects.toMatchObject({
      status: 404,
    });
    expect(repository.listForBranch).not.toHaveBeenCalled();
  });

  it('refuses ranges over 366 days before reading the student', async () => {
    const { service, students } = setup([]);
    await expect(
      service.list(scope, 'student-1', {
        from: '2026-01-01',
        to: '2027-06-01',
      }),
    ).rejects.toThrow('Range is limited to 366 days');
    expect(students.read).not.toHaveBeenCalled();
  });
});
