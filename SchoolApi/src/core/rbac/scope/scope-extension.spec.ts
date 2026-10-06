import type { ActiveAssignment } from '../access/active-assignment';
import { ScopeService } from './scope.service';

const a = (overrides: Partial<ActiveAssignment>): ActiveAssignment => ({
  id: 'a',
  roleId: 'r',
  roleKey: 'TEACHER',
  roleName: 'Teacher',
  scopeType: 'BRANCH',
  schoolId: 'school',
  schoolName: null,
  branchId: 'branch',
  branchName: null,
  sectionId: null,
  subjectId: null,
  validFrom: new Date(0).toISOString(),
  validUntil: null,
  ...overrides,
});

const section = (id: string) => ({
  id,
  branchId: 'branch',
  schoolId: 'school',
});

describe('ScopeService (Phase 2 scopes)', () => {
  it('teachers reach only assigned sections, not the whole branch', () => {
    const scope = ScopeService.resolve([
      a({}),
      a({ scopeType: 'SECTION', sectionId: '5a' }),
      a({ scopeType: 'SUBJECT_SECTION', sectionId: '5b', subjectId: 'math' }),
    ]);
    expect(scope.sectionLimited).toBe(true);
    expect(scope.canReadBranch({ id: 'branch', schoolId: 'school' })).toBe(
      true,
    );
    expect(scope.canManageBranch({ id: 'branch', schoolId: 'school' })).toBe(
      false,
    );
    expect(scope.canReadSection(section('5a'))).toBe(true);
    expect(scope.canReadSection(section('5b'))).toBe(true);
    expect(scope.canReadSection(section('4a'))).toBe(false);
  });

  it('class teacher teaches every subject, subject teacher only theirs', () => {
    const scope = ScopeService.resolve([
      a({ scopeType: 'SECTION', sectionId: '5a' }),
      a({ scopeType: 'SUBJECT_SECTION', sectionId: '5b', subjectId: 'math' }),
    ]);
    expect(scope.canTeach('5a', 'english')).toBe(true);
    expect(scope.canTeach('5b', 'math')).toBe(true);
    expect(scope.canTeach('5b', 'english')).toBe(false);
  });

  it('coordinator at branch level reads every section of the branch', () => {
    const scope = ScopeService.resolve([a({ roleKey: 'COORDINATOR' })]);
    expect(scope.sectionLimited).toBe(false);
    expect(scope.canReadSection(section('anything'))).toBe(true);
  });

  it('coordinator assigned to sections only reads those', () => {
    const scope = ScopeService.resolve([
      a({ roleKey: 'COORDINATOR', scopeType: 'SECTION', sectionId: '4a' }),
    ]);
    expect(scope.canReadSection(section('4a'))).toBe(true);
    expect(scope.canReadSection(section('4b'))).toBe(false);
  });

  it('parents see verified children only and get 404 for others', () => {
    const scope = ScopeService.resolve(
      [a({ roleKey: 'PARENT', scopeType: 'GUARDIAN', branchId: null })],
      ['child-1'],
    );
    expect(scope.guardian).toBe(true);
    expect(scope.canAccessStudent('child-1')).toBe(true);
    expect(scope.canAccessStudent('child-2')).toBe(false);
    let code: string | undefined;
    try {
      scope.assertReadSection(section('5a'), 'Student');
    } catch (error) {
      code = (error as { code: string }).code;
    }
    expect(code).toBe('NOT_FOUND');
  });

  it('ignores student ids when the active role is not a guardian', () => {
    const scope = ScopeService.resolve(
      [a({ roleKey: 'PRINCIPAL' })],
      ['child-1'],
    );
    expect(scope.canAccessStudent('child-1')).toBe(false);
  });
});
