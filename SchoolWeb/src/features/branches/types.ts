import type { RecordStatus } from "@/config/options";

export interface BranchTimings {
  opensAt: string;
  closesAt: string;
  attendanceLockAt: string;
}

export interface Branch {
  id: string;
  schoolId: string;
  schoolName: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timings: BranchTimings | null;
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  workingDays: number[];
  principal: { id: string; name: string } | null;
  status: RecordStatus;
  createdAt: string;
}

export interface BranchInput {
  schoolId?: string;
  code?: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  timings?: BranchTimings | null;
  workingDays?: number[];
}

export type BranchSettings = Record<string, unknown>;
