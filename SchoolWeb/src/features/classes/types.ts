export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  levelOrder: number;
  subjectCount: number;
}

export interface SchoolClassInput {
  schoolId?: string;
  name: string;
  levelOrder: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  code: string;
  name: string;
}

export interface SubjectInput {
  schoolId?: string;
  code: string;
  name: string;
}

export interface Room {
  id: string;
  branchId: string;
  name: string;
  capacity: number | null;
}

export interface RoomInput {
  branchId?: string;
  name: string;
  capacity: number | null;
}

export interface Section {
  id: string;
  branchId: string;
  sessionId: string;
  classId: string;
  className: string;
  name: string;
  capacity: number;
  room: { id: string; name: string } | null;
  studentCount: number;
  status: string;
  /** Filled from Phase 2 staff assignments. */
  classTeacher?: { id: string; name: string } | null;
}

export interface SectionCreateInput {
  branchId: string;
  sessionId: string;
  classId: string;
  name: string;
  capacity: number;
  roomId?: string;
}

export interface SectionUpdateInput {
  name: string;
  capacity: number;
  roomId: string | null;
}
