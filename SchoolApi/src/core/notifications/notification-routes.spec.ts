import type { NotificationsRepository } from './notifications.repository';
import { NotificationInboxService } from './notification-inbox.service';
import { notificationRoute, withRoute } from './notification-routes';

describe('notificationRoute', () => {
  const cases: [string, Record<string, unknown>, string, string][] = [
    [
      'MESSAGE',
      { threadId: 't-1', messageId: 'm' },
      'TEACHER',
      '/messages?open=t-1',
    ],
    ['MESSAGE', { threadId: 't-1' }, 'PARENT', '/messages?open=t-1'],
    ['MEETING', { meetingId: 'x' }, 'TEACHER', '/meetings'],
    ['COMPLAINT', { complaintId: 'x' }, 'PRINCIPAL', '/complaints'],
    ['APPROVAL', { approvalId: 'x' }, 'PRINCIPAL', '/approvals'],
    ['EXAM', { examId: 'e1' }, 'TEACHER', '/exams/e1'],
    ['EXAM', { examId: 'e1' }, 'PARENT', '/progress'],
    ['RESULT', {}, 'PARENT', '/progress'],
    ['ACTIVITY', { activityId: 'a' }, 'PARENT', '/timetable'],
    ['CONSENT', { activityId: 'a' }, 'TEACHER', '/activities'],
    ['NOTICE', { noticeId: 'n' }, 'PARENT', '/messages'],
    ['NOTICE', { noticeId: 'n' }, 'COORDINATOR', '/notices'],
    ['NOTICE', { backupId: 'b', kind: 'FAILED' }, 'SUPER_ADMIN', '/settings'],
    ['HEALTH', { incidentId: 'i' }, 'PARENT', '/students'],
    ['HEALTH', { incidentId: 'i' }, 'PRINCIPAL', '/health'],
    ['PICKUP', { earlyLeaveId: 'l' }, 'PARENT', '/messages'],
    ['PICKUP', { departureId: 'd' }, 'PARENT', '/students'],
    ['PICKUP', { earlyLeaveId: 'l' }, 'TEACHER', '/pickup'],
    ['PAYROLL', { runId: 'r' }, 'ACCOUNTANT', '/payroll'],
    ['PAYROLL', { month: '2026-11' }, 'TEACHER', '/my-salary'],
    ['FEE', { invoiceId: 'i' }, 'PARENT', '/fees'],
    ['ROLE', { branchId: 'b1' }, 'PRINCIPAL', '/branches?open=b1'],
    ['STUDENTS', { studentId: 's1' }, 'PRINCIPAL', '/students/s1'],
  ];

  it.each(cases)('%s %j for %s opens %s', (category, data, role, route) => {
    expect(notificationRoute(category, data, role)).toBe(route);
  });

  it('never builds a path from unsafe ids', () => {
    expect(
      notificationRoute('MESSAGE', { threadId: '../x?y' }, 'TEACHER'),
    ).toBe('/messages');
    expect(notificationRoute('EXAM', { examId: 'a/b' }, 'TEACHER')).toBe(
      '/exams',
    );
  });

  it('returns null for unknown categories', () => {
    expect(notificationRoute('SOMETHING', {}, 'TEACHER')).toBeNull();
  });
});

describe('withRoute', () => {
  it('adds a route, keeping the other data', () => {
    expect(withRoute('MEETING', { meetingId: 'm' }, 'PARENT')).toEqual({
      meetingId: 'm',
      route: '/meetings',
    });
  });

  it('keeps a route the sender already set', () => {
    const data = { route: '/custom' };
    expect(withRoute('MEETING', data, 'PARENT')).toBe(data);
  });

  it('works when data is missing', () => {
    expect(withRoute('LEAVE', null, 'PRINCIPAL')).toEqual({
      route: '/approvals',
    });
    expect(withRoute('UNKNOWN', null, 'PRINCIPAL')).toBeNull();
  });
});

describe('NotificationInboxService.list', () => {
  it('adds data.route for the reader role', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue({
        rows: [
          {
            id: 'n1',
            category: 'MESSAGE',
            title: 'New message',
            body: 'Hi',
            data: { threadId: 't1', messageId: 'm1' },
            readAt: null,
            createdAt: new Date('2026-11-27T10:00:00Z'),
          },
        ],
        total: 1,
      }),
    };
    const service = new NotificationInboxService(
      repository as unknown as NotificationsRepository,
    );
    const page = await service.list('u1', { page: 1, pageSize: 20 }, 'PARENT');
    expect(page.data[0].data).toEqual({
      threadId: 't1',
      messageId: 'm1',
      route: '/messages?open=t1',
    });
  });
});
