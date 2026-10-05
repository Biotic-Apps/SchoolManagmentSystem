import type { RecordStatus } from "@/config/options";

export interface School {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  status: RecordStatus;
  branchCount: number;
  createdAt: string;
}

export interface SchoolInput {
  code?: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoFileId?: string | null;
}

export type StatusAction = "archive" | "activate";
