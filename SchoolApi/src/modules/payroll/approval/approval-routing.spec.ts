import { routeLines } from './approval-routing';

const lines = [
  { id: 'l-principal', staffUserId: 'u-principal' },
  { id: 'l-teacher', staffUserId: 'u-teacher' },
  { id: 'l-helper', staffUserId: null },
  { id: 'l-admin', staffUserId: 'u-admin' },
];

describe('payroll approval routing', () => {
  it('routes the principal approver own line to super admin', () => {
    const routing = routeLines(lines, {
      callerId: 'u-principal',
      callerIsSuperAdmin: false,
      principalUserId: 'u-principal',
    });
    expect(routing.superAdmin).toEqual(['l-principal']);
    expect(routing.branch).toEqual(['l-teacher', 'l-helper', 'l-admin']);
  });

  it('routes the principal line to super admin when another non-super-admin approves', () => {
    const routing = routeLines(lines, {
      callerId: 'u-other',
      callerIsSuperAdmin: false,
      principalUserId: 'u-principal',
    });
    expect(routing.superAdmin).toEqual(['l-principal']);
  });

  it('lets a super admin approve every line except their own directly', () => {
    const routing = routeLines(lines.slice(0, 3), {
      callerId: 'u-admin',
      callerIsSuperAdmin: true,
      principalUserId: 'u-principal',
    });
    expect(routing.superAdmin).toEqual([]);
    expect(routing.branch).toEqual(['l-principal', 'l-teacher', 'l-helper']);
  });

  it('routes a super admin own line to another super admin', () => {
    const routing = routeLines(lines, {
      callerId: 'u-admin',
      callerIsSuperAdmin: true,
      principalUserId: 'u-principal',
    });
    expect(routing.superAdmin).toEqual(['l-admin']);
  });

  it('does not treat staff without a login as the principal', () => {
    const routing = routeLines(lines, {
      callerId: 'u-x',
      callerIsSuperAdmin: false,
      principalUserId: null,
    });
    expect(routing.superAdmin).toEqual([]);
  });
});
