import { z } from "zod";
import { documentSchema } from "@/features/documents/schemas";
import {
  EMPTY_CHILD,
  EMPTY_GUARDIAN,
  EMPTY_MEDICAL,
  childSchema,
  guardianListSchema,
  medicalSchema,
  toChildInput,
  toGuardianEntries,
  toMedicalInput,
} from "@/features/people/schemas";
import { blankToUndefined, optionalText } from "@/lib/validation";
import type { Application, ApplicationInput } from "./types";

export * from "./enquiry-schemas";
export * from "./action-schemas";

export const applicationSchema = z.object({
  classId: z.string().min(1, "Choose a class"),
  child: childSchema,
  guardians: guardianListSchema,
  medical: medicalSchema,
  documents: z.array(documentSchema),
  notes: optionalText(1000),
});
export type ApplicationFormValues = z.infer<typeof applicationSchema>;

function fromApplication(item: Application): ApplicationFormValues {
  const { child, medical } = item;
  return {
    classId: item.classId,
    child: {
      firstName: child?.firstName ?? "",
      lastName: child?.lastName ?? "",
      dob: child?.dob ?? "",
      gender: child?.gender ?? "",
      bForm: child?.bForm ?? "",
      previousSchool: child?.previousSchool ?? "",
      photoFileId: "",
    },
    guardians: (item.guardians ?? []).map((guardian) => ({
      name: guardian.name ?? "",
      relation: guardian.relation ?? "",
      cnic: guardian.cnic ?? "",
      phone: guardian.phone ?? "",
      email: guardian.email ?? "",
      occupation: guardian.occupation ?? "",
      address: guardian.address ?? "",
      isPrimary: !!guardian.isPrimary,
    })),
    medical: {
      allergies: medical?.allergies ?? "",
      conditions: medical?.conditions ?? "",
      notes: medical?.notes ?? "",
    },
    documents: [],
    notes: item.notes ?? "",
  };
}

export function applicationFormDefaults(item: Application | null, classId: string | undefined): ApplicationFormValues {
  if (item) return fromApplication(item);
  return {
    classId: classId ?? "",
    child: { ...EMPTY_CHILD },
    guardians: [{ ...EMPTY_GUARDIAN, isPrimary: true }],
    medical: { ...EMPTY_MEDICAL },
    documents: [],
    notes: "",
  };
}

export function toApplicationInput(
  values: ApplicationFormValues,
  context: { branchId: string; sessionId: string },
): ApplicationInput {
  return {
    branchId: context.branchId,
    sessionId: context.sessionId,
    classId: values.classId,
    child: toChildInput(values.child),
    guardians: toGuardianEntries(values.guardians),
    medical: toMedicalInput(values.medical),
    notes: blankToUndefined(values.notes),
  };
}
