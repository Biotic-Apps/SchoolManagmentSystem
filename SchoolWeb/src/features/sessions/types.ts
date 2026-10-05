export type SessionStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export interface AcademicSession {
  id: string;
  branchId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SessionStatus;
  termCount: number;
}

export interface AcademicSessionInput {
  branchId?: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Term {
  id: string;
  sessionId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface TermInput {
  name: string;
  startDate: string;
  endDate: string;
}

export type CalendarEventType = "HOLIDAY" | "VACATION" | "DEADLINE" | "EVENT";

export interface CalendarEvent {
  id: string;
  schoolId: string;
  branchId: string | null;
  type: CalendarEventType;
  title: string;
  startDate: string;
  endDate: string;
  description: string | null;
}

export interface CalendarEventInput {
  schoolId?: string;
  branchId?: string | null;
  type: CalendarEventType;
  title: string;
  startDate: string;
  endDate: string;
  description?: string | null;
}
