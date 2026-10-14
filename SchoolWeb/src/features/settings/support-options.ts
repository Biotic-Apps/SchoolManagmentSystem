import type { Option } from "@/components/shared/OptionSelect";

export const CHANNEL_OPTIONS: Option[] = [
  { id: "EMAIL", name: "Email" },
  { id: "SMS", name: "SMS" },
  { id: "PUSH", name: "Push" },
];

const KNOWN_QUEUES = [
  "notifications",
  "documents",
  "reports",
  "imports",
  "backups",
  "maintenance",
  "fees",
  "payroll",
  "exams",
];

export const QUEUE_OPTIONS: Option[] = KNOWN_QUEUES.map((queue) => ({
  id: queue,
  name: queue.charAt(0).toUpperCase() + queue.slice(1),
}));

export const JOB_STATUS_OPTIONS: Option[] = [
  { id: "FAILED", name: "Failed" },
  { id: "RUNNING", name: "Running" },
  { id: "DONE", name: "Done" },
];
