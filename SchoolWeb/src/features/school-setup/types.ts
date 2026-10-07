export type Preset = "STANDARD" | "NONE";

/** POST /schools/setup body (docs/api/school-setup-contract.md §1). */
export interface SchoolSetupInput {
  school: {
    code: string;
    name: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    logoFileId?: string;
  };
  branch: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    timings: { opensAt: string; closesAt: string; attendanceLockAt: string };
    workingDays: number[];
  };
  principal: { name: string; email?: string; phone?: string; password?: string };
  academics: {
    createSession: boolean;
    sessionName?: string;
    startDate?: string;
    endDate?: string;
    classesPreset?: Preset;
    sectionsPerClass?: number;
    subjectsPreset?: Preset;
    /** Only sent when the admin unticked some preset entries (see contract Deviations). */
    classNames?: string[];
    subjectNames?: string[];
  };
}

interface Ref {
  id: string;
  code: string;
  name: string;
}

export interface SchoolSetupResult {
  school: Ref;
  branch: Ref;
  principal: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    /** Only when generated; shown once. */
    temporaryPassword?: string | null;
  };
  session: { id: string; name: string; startDate: string; endDate: string } | null;
  counts: { classes: number; sections: number; subjects: number };
}

export type ChecklistKey = "session" | "classes" | "subjects" | "teachers" | "students" | "timetable" | "feePlan";

export interface ChecklistItem {
  key: ChecklistKey | string;
  done: boolean;
  count: number;
}

/** GET /setup/checklist */
export interface SetupChecklist {
  branchId: string;
  complete: boolean;
  items: ChecklistItem[];
}
