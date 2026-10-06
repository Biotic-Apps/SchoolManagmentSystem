import { z } from "zod";
import { EMPTY_CHILD, EMPTY_GUARDIAN, childSchema, guardianListSchema, toChildInput, toGuardianEntries } from "@/features/people/schemas";
import type { Gender } from "@/features/people/types";
import { toIsoDate } from "@/lib/dates";
import { blankToUndefined, isoDate, optionalText, requiredText } from "@/lib/validation";
import type { RegisterStudentInput, StudentDetail, StudentUpdate } from "./types";

export const registerStudentSchema = z.object({
  child: childSchema,
  guardians: guardianListSchema,
  classId: z.string(),
  sectionId: z.string().min(1, "Choose a section"),
  admissionDate: isoDate,
});
export type RegisterStudentValues = z.infer<typeof registerStudentSchema>;

export const registerStudentDefaults = (classId: string | undefined): RegisterStudentValues => ({
  child: EMPTY_CHILD,
  guardians: [{ ...EMPTY_GUARDIAN, isPrimary: true }],
  classId: classId ?? "",
  sectionId: "",
  admissionDate: toIsoDate(new Date()),
});

export const toRegisterStudentInput = (values: RegisterStudentValues): RegisterStudentInput => ({
  child: toChildInput(values.child),
  guardians: toGuardianEntries(values.guardians),
  sectionId: values.sectionId,
  admissionDate: values.admissionDate,
});

export const editStudentSchema = z.object({
  firstName: requiredText("the first name", 60),
  lastName: requiredText("the last name", 60),
  dob: isoDate,
  gender: z.string().min(1, "Choose a gender"),
  bForm: childSchema.shape.bForm,
  photoFileId: z.string(),
  address: optionalText(255),
});
export type EditStudentValues = z.infer<typeof editStudentSchema>;

// bForm starts blank: the API returns it masked, so blank means "unchanged".
export const editStudentDefaults = (student: StudentDetail): EditStudentValues => ({
  firstName: student.firstName ?? "",
  lastName: student.lastName ?? "",
  dob: student.dob ?? "",
  gender: student.gender ?? "",
  bForm: "",
  photoFileId: "",
  address: student.address ?? "",
});

export const toStudentUpdate = (values: EditStudentValues): StudentUpdate => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  dob: values.dob,
  gender: values.gender as Gender,
  bForm: blankToUndefined(values.bForm),
  photoFileId: blankToUndefined(values.photoFileId),
  address: values.address.trim(),
});
