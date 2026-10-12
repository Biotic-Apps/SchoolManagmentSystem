import type { RoleKey } from "@/config/roles";

/** GET/PATCH /settings/school/:schoolId (phase5-contract §A). */
export interface SchoolSettings {
  schoolId: string;
  displayName: string;
  logoFileId: string | null;
  logoUrl: string | null;
  primaryColor: string;
  receiptFooter: string | null;
  reportCardFooter: string | null;
  timezone: string;
  currency: string;
  locale: string;
}

export interface SchoolSettingsInput {
  displayName: string;
  logoFileId: string | null;
  primaryColor: string;
  receiptFooter: string | null;
  reportCardFooter: string | null;
}

export interface CategoryChannels {
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

/** GET/PATCH /settings/notifications?schoolId= */
export interface NotificationSettings {
  email: { enabled: boolean; fromName: string | null };
  sms: { enabled: boolean; senderId: string | null };
  push: { enabled: boolean };
  whatsapp: { enabled: boolean };
  categories: CategoryChannels[];
}

export const APPROVAL_LIMIT_TYPES = ["CONCESSION", "REFUND", "EXPENSE", "PURCHASE_ORDER"] as const;
export type ApprovalLimitType = (typeof APPROVAL_LIMIT_TYPES)[number];

export interface LateFeeDefault {
  amountMinor: number;
  afterDays: number;
}

/** GET/PATCH /settings/policies?schoolId= (branch settings still override per branch). */
export interface PolicySettings {
  attendanceLockTime: string;
  diaryModeration: boolean;
  gradingDefault: string | null;
  feeLateFeeDefault: LateFeeDefault | null;
  approvalLimits: Record<string, number>;
  passwordPolicy: { minLength: number; requireDigit: boolean };
  sessionTimeoutMinutes: number;
  twoFactorRequiredFor: RoleKey[];
}
