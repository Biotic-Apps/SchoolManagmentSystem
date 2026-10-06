import {
  Prisma,
  type StudentHealthProfile,
} from '../../../generated/prisma/client';
import { toJson } from '../../../core/common/prisma-json';
import type {
  AllergyDto,
  DoctorDto,
  EmergencyContactDto,
  HealthChangesDto,
  HealthProfileDto,
  MedicationDto,
} from '../dto/health-profile.dto';

export type HealthProfileData = Omit<HealthProfileDto, 'updatedAt'>;

const list = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

export const EMPTY_PROFILE: HealthProfileDto = {
  bloodGroup: null,
  allergies: [],
  conditions: [],
  medications: [],
  instructions: null,
  doctor: null,
  emergencyContacts: [],
  updatedAt: null,
};

export function toHealthProfile(
  row: StudentHealthProfile | null,
): HealthProfileDto {
  if (!row) return { ...EMPTY_PROFILE };
  return {
    bloodGroup: row.bloodGroup,
    allergies: list<AllergyDto>(row.allergyList),
    conditions: list<string>(row.conditionList),
    medications: list<MedicationDto>(row.medications),
    instructions: row.instructions,
    doctor: (row.doctor as DoctorDto | null) ?? null,
    emergencyContacts: list<EmergencyContactDto>(row.emergencyContacts),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** security.md §2.1: helpers see allergies and instructions only. */
export function toHelperView(profile: HealthProfileDto): HealthProfileDto {
  return {
    ...EMPTY_PROFILE,
    allergies: profile.allergies,
    instructions: profile.instructions,
    updatedAt: profile.updatedAt,
  };
}

/** Normalises a body into plain data (drops class instances / undefined). */
export function toProfileData(input: HealthChangesDto): HealthProfileData {
  return {
    bloodGroup: input.bloodGroup ?? null,
    allergies: (input.allergies ?? []).map((a) => ({
      name: a.name,
      severity: a.severity,
      reaction: a.reaction ?? null,
    })),
    conditions: input.conditions ?? [],
    medications: (input.medications ?? []).map((m) => ({
      name: m.name,
      dose: m.dose ?? null,
      schedule: m.schedule ?? null,
    })),
    instructions: input.instructions ?? null,
    doctor: input.doctor
      ? { name: input.doctor.name, phone: input.doctor.phone }
      : null,
    emergencyContacts: (input.emergencyContacts ?? []).map((c) => ({
      name: c.name,
      relation: c.relation,
      phone: c.phone,
      priority: c.priority,
    })),
  };
}

/** Only the keys the parent actually sent. */
export function pickChanges(
  input: HealthChangesDto,
): Partial<HealthProfileData> {
  const normalised = toProfileData(input);
  const changes: Partial<HealthProfileData> = {};
  for (const key of Object.keys(normalised) as (keyof HealthProfileData)[]) {
    if (input[key] !== undefined) {
      (changes as Record<string, unknown>)[key] = normalised[key];
    }
  }
  return changes;
}

export function mergeProfile(
  current: HealthProfileDto,
  changes: Partial<HealthProfileData>,
): HealthProfileData {
  return {
    bloodGroup: current.bloodGroup,
    allergies: current.allergies,
    conditions: current.conditions,
    medications: current.medications,
    instructions: current.instructions,
    doctor: current.doctor,
    emergencyContacts: current.emergencyContacts,
    ...changes,
  };
}

/** Prisma columns for a profile, mirrored into the legacy text columns. */
export function toProfileColumns(data: HealthProfileData, userId: string) {
  return {
    bloodGroup: data.bloodGroup,
    allergyList: toJson(data.allergies),
    conditionList: toJson(data.conditions),
    medications: toJson(data.medications),
    instructions: data.instructions,
    doctor: data.doctor ? toJson(data.doctor) : Prisma.DbNull,
    emergencyContacts: toJson(data.emergencyContacts),
    allergies: data.allergies.map((a) => a.name).join(', ') || null,
    conditions: data.conditions.join(', ') || null,
    notes: data.instructions,
    updatedById: userId,
  };
}
