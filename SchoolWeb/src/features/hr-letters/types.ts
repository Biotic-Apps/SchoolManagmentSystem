export type HrLetterType = "EXPERIENCE" | "SALARY_CERTIFICATE" | "RELIEVING" | "CUSTOM";

export type HrLetterTemplateStatus = "ACTIVE" | "ARCHIVED";

export interface HrLetterTemplate {
  id: string;
  schoolId: string;
  type: HrLetterType;
  title: string;
  bodyTemplate: string;
  status: HrLetterTemplateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HrLetterStaff {
  id: string;
  name: string;
  designation: string;
}

export interface HrLetter {
  id: string;
  schoolId: string;
  staffId: string;
  templateId: string;
  type: HrLetterType;
  subject: string;
  body: string;
  staff: HrLetterStaff;
  fileUrl: string | null;
  issuedAt: string;
  createdAt: string;
}

export interface GenerateHrLetterInput {
  templateId: string;
  subject?: string;
  effectiveDate?: string;
}
