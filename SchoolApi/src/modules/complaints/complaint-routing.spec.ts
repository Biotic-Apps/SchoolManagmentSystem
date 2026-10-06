import {
  escalationChain,
  pickAssignee,
  routeComplaint,
  type RoutingCandidates,
  type RoutingInput,
} from './complaint-routing';

const candidates: RoutingCandidates = {
  classTeacherUserId: 'class-teacher',
  coordinatorUserIds: ['coord-1', 'coord-2'],
  principalUserId: 'principal',
  superAdminUserIds: ['admin-1', 'admin-2'],
};

const input = (over: Partial<RoutingInput>): RoutingInput => ({
  complainantId: 'complainant',
  complainantRole: 'PARENT',
  category: 'ACADEMIC',
  againstUserId: null,
  candidates,
  ...over,
});

describe('routeComplaint', () => {
  it('routes an academic parent complaint to the class teacher', () => {
    expect(routeComplaint(input({}))).toBe('class-teacher');
  });

  it('routes other parent complaints to the principal', () => {
    expect(routeComplaint(input({ category: 'FACILITY' }))).toBe('principal');
  });

  it('routes staff complaints to the first coordinator', () => {
    for (const role of ['TEACHER', 'HELPER', 'ACCOUNTANT']) {
      expect(routeComplaint(input({ complainantRole: role }))).toBe('coord-1');
    }
  });

  it('routes staff complaints to the principal without a coordinator', () => {
    const none = { ...candidates, coordinatorUserIds: [] };
    expect(
      routeComplaint(input({ complainantRole: 'TEACHER', candidates: none })),
    ).toBe('principal');
  });

  it('routes coordinator and head teacher complaints to the principal', () => {
    expect(routeComplaint(input({ complainantRole: 'COORDINATOR' }))).toBe(
      'principal',
    );
    expect(routeComplaint(input({ complainantRole: 'HEAD_TEACHER' }))).toBe(
      'principal',
    );
  });

  it('routes principal complaints to a super admin', () => {
    expect(routeComplaint(input({ complainantRole: 'PRINCIPAL' }))).toBe(
      'admin-1',
    );
  });

  it('never routes to the person complained about and falls through', () => {
    expect(routeComplaint(input({ againstUserId: 'class-teacher' }))).toBe(
      'coord-1',
    );
    expect(
      routeComplaint(
        input({ complainantRole: 'TEACHER', againstUserId: 'coord-1' }),
      ),
    ).toBe('coord-2');
    expect(
      routeComplaint(
        input({ category: 'STAFF_BEHAVIOUR', againstUserId: 'principal' }),
      ),
    ).toBe('admin-1');
    expect(
      routeComplaint(
        input({ complainantRole: 'PRINCIPAL', againstUserId: 'admin-1' }),
      ),
    ).toBe('admin-2');
  });

  it('falls through the full chain when links are missing', () => {
    const sparse: RoutingCandidates = {
      classTeacherUserId: null,
      coordinatorUserIds: [],
      principalUserId: 'principal',
      superAdminUserIds: ['admin-1'],
    };
    expect(
      routeComplaint(input({ candidates: sparse, againstUserId: 'principal' })),
    ).toBe('admin-1');
  });

  it('never routes to the complainant', () => {
    expect(
      routeComplaint(
        input({ complainantId: 'principal', complainantRole: 'COORDINATOR' }),
      ),
    ).toBe('admin-1');
  });

  it('returns null when nobody is eligible', () => {
    const only: RoutingCandidates = {
      classTeacherUserId: null,
      coordinatorUserIds: [],
      principalUserId: null,
      superAdminUserIds: ['admin-1'],
    };
    expect(
      routeComplaint(input({ candidates: only, againstUserId: 'admin-1' })),
    ).toBeNull();
  });
});

describe('escalation', () => {
  const exclude = { complainantId: 'complainant', againstUserId: null };

  it('escalates level 1 to the principal and level 2 to a super admin', () => {
    expect(pickAssignee(escalationChain(1, candidates), exclude)).toBe(
      'principal',
    );
    expect(pickAssignee(escalationChain(2, candidates), exclude)).toBe(
      'admin-1',
    );
  });

  it('skips the principal when the complaint is against them', () => {
    expect(
      pickAssignee(escalationChain(1, candidates), {
        ...exclude,
        againstUserId: 'principal',
      }),
    ).toBe('admin-1');
  });
});
