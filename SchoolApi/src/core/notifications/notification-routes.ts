/**
 * In-app path a notification opens (`data.route`), matching the web portal
 * routes (docs/navigation.md). Worked out when the inbox is read, from the
 * category, the ids in `data` and the reader's active role, so notifications
 * stored before routes existed deep-link too. A `route` already in `data`
 * wins.
 */
type Data = Record<string, unknown>;

const id = (data: Data, key: string): string | null => {
  const value = data[key];
  return typeof value === 'string' && /^[\w-]+$/.test(value) ? value : null;
};

function parentRoute(category: string, data: Data): string | null {
  switch (category) {
    case 'MESSAGE': {
      const thread = id(data, 'threadId');
      return thread ? `/messages?open=${thread}` : '/messages';
    }
    case 'NOTICE':
      return '/messages'; // "Messages, Notices & Requests"
    case 'PICKUP':
      // Early-leave requests live under Requests; people and departures on the child profile.
      return id(data, 'earlyLeaveId') ? '/messages' : '/students';
    case 'HEALTH':
    case 'STUDENTS':
      return '/students';
    case 'ACTIVITY':
    case 'CONSENT':
    case 'TIMETABLE':
      return '/timetable';
    case 'EXAM':
    case 'RESULT':
      return '/progress';
    case 'ATTENDANCE':
    case 'LEAVE':
      return '/attendance';
    case 'DIARY':
      return '/diary';
    case 'FEE':
      return '/fees';
    case 'CERTIFICATE':
      return '/certificates';
    case 'MEETING':
      return '/meetings';
    case 'COMPLAINT':
      return '/complaints';
    default:
      return null;
  }
}

function staffRoute(category: string, data: Data): string | null {
  switch (category) {
    case 'MESSAGE': {
      const thread = id(data, 'threadId');
      return thread ? `/messages?open=${thread}` : '/messages';
    }
    case 'APPROVAL':
    case 'LEAVE':
      return '/approvals';
    case 'EXAM': {
      const exam = id(data, 'examId');
      return exam ? `/exams/${exam}` : '/exams';
    }
    case 'RESULT':
      return '/exams';
    case 'PAYROLL':
      // Payslip notices carry only the month; run notices carry the run.
      return id(data, 'runId') ? '/payroll' : '/my-salary';
    case 'ROLE': {
      const branch = id(data, 'branchId');
      return branch ? `/branches?open=${branch}` : '/dashboard';
    }
    case 'NOTICE':
      return 'backupId' in data ? '/settings' : '/notices';
    case 'ACTIVITY':
    case 'CONSENT':
      return '/activities';
    case 'STUDENTS': {
      const student = id(data, 'studentId');
      return student ? `/students/${student}` : '/students';
    }
    case 'ATTENDANCE':
      return '/attendance';
    case 'DIARY':
      return '/diary';
    case 'COMPLAINT':
      return '/complaints';
    case 'MEETING':
      return '/meetings';
    case 'HEALTH':
      return '/health';
    case 'PICKUP':
      return '/pickup';
    case 'FEE':
      return '/fees';
    case 'EXPENSE':
      return '/expenses';
    case 'INVENTORY':
      return '/inventory';
    case 'CERTIFICATE':
      return '/certificates';
    case 'TIMETABLE':
      return '/timetable';
    default:
      return null;
  }
}

export function notificationRoute(
  category: string,
  data: unknown,
  activeRole: string,
): string | null {
  const values: Data =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Data)
      : {};
  return activeRole === 'PARENT'
    ? parentRoute(category, values)
    : staffRoute(category, values);
}

/** `data` with a `route` added when one is known (an existing route is kept). */
export function withRoute(
  category: string,
  data: unknown,
  activeRole: string,
): unknown {
  const base =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Data)
      : null;
  if (base && typeof base.route === 'string') return data;
  const route = notificationRoute(category, data, activeRole);
  if (!route) return data;
  return { ...(base ?? {}), route };
}
