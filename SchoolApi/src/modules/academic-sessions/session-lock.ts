import { recordLocked } from '../../core/common/errors/errors';

/** Closed sessions are read-only (backendFlows.md §1.3). */
export function assertSessionOpen(session: { status: string }): void {
  if (session.status === 'CLOSED')
    throw recordLocked('Academic session is closed');
}
