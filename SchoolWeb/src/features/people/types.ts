// Person shapes shared by admissions, students and guardians (phase2-contract §1, §4).

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type Relation = "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";

export interface PersonRef {
  id: string;
  name: string;
}

export interface ChildInput {
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  bForm?: string;
  previousSchool?: string;
  photoFileId?: string;
}

export interface GuardianInput {
  name: string;
  relation: Relation;
  cnic?: string;
  phone: string;
  email?: string;
  occupation?: string;
  address?: string;
}

/** Guardian row inside an application / registration (exactly one is primary). */
export interface GuardianEntry extends GuardianInput {
  isPrimary: boolean;
}

export interface MedicalInfo {
  allergies?: string | null;
  conditions?: string | null;
  notes?: string | null;
}
