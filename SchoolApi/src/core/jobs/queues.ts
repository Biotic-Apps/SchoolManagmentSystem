export const QUEUES = {
  NOTIFICATIONS: 'notifications',
  DOCUMENTS: 'documents',
  REPORTS: 'reports',
  IMPORTS: 'imports',
  PAYROLL: 'payroll',
  MAINTENANCE: 'maintenance',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

/** Queues that have processors (and therefore BullMQ workers) today. */
export const ACTIVE_QUEUES: QueueName[] = [
  QUEUES.NOTIFICATIONS,
  QUEUES.DOCUMENTS,
  QUEUES.REPORTS,
  QUEUES.PAYROLL,
  QUEUES.MAINTENANCE,
];
