import { z } from "zod";
import { blankToUndefined, isoDate, optionalEmail, optionalPhone, optionalText, requiredText } from "@/lib/validation";
import type { StaffDetail, StaffInput, StaffRoleKey, StaffUpdate } from "./types";

const optionalCnic = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{5}-?\d{7}-?\d$/.test(value), { message: "Use 13 digits, e.g. 35202-1234567-1" });

const profileFields = {
  name: requiredText("the full name"),
  email: optionalEmail,
  phone: optionalPhone,
  employeeNo: optionalText(40),
  designation: z.string().min(1, "Choose a designation"),
  joinDate: isoDate,
  cnic: optionalCnic,
  qualification: optionalText(160),
  photoFileId: z.string(),
};

export const staffSchema = z
  .object({ ...profileFields, createAccount: z.boolean(), roleKey: z.string() })
  .refine((v) => !v.createAccount || !!v.email.trim() || !!v.phone.trim(), {
    path: ["email"],
    message: "Enter an email or a phone number to create a sign-in account",
  })
  .refine((v) => !v.createAccount || !!v.roleKey, { path: ["roleKey"], message: "Choose the account role" });

export type StaffFormValues = z.infer<typeof staffSchema>;

export const STAFF_DEFAULTS: StaffFormValues = {
  name: "",
  email: "",
  phone: "",
  employeeNo: "",
  designation: "",
  joinDate: "",
  cnic: "",
  qualification: "",
  photoFileId: "",
  createAccount: false,
  roleKey: "",
};

type ProfileValues = Omit<StaffFormValues, "createAccount" | "roleKey">;

function toProfile(values: ProfileValues): StaffUpdate {
  return {
    name: values.name.trim(),
    email: blankToUndefined(values.email),
    phone: blankToUndefined(values.phone),
    employeeNo: blankToUndefined(values.employeeNo),
    designation: values.designation,
    joinDate: values.joinDate,
    cnic: blankToUndefined(values.cnic),
    qualification: blankToUndefined(values.qualification),
    photoFileId: blankToUndefined(values.photoFileId),
  };
}

export function toStaffInput(values: StaffFormValues, branchId: string): StaffInput {
  return {
    ...toProfile(values),
    name: values.name.trim(),
    designation: values.designation,
    joinDate: values.joinDate,
    branchId,
    createAccount: values.createAccount,
    ...(values.createAccount ? { roleKey: values.roleKey as StaffRoleKey } : {}),
  };
}

export const editStaffSchema = z.object(profileFields);

export type EditStaffValues = z.infer<typeof editStaffSchema>;

/** CNIC arrives masked, so the field starts blank and blank means "unchanged". */
export function editStaffDefaults(staff: StaffDetail): EditStaffValues {
  return {
    name: staff.name,
    email: staff.email ?? "",
    phone: staff.phone ?? "",
    employeeNo: staff.employeeNo ?? "",
    designation: staff.designation ?? "",
    joinDate: staff.joinDate ? staff.joinDate.slice(0, 10) : "",
    cnic: "",
    qualification: staff.qualification ?? "",
    photoFileId: "",
  };
}

export const toStaffUpdate = (values: EditStaffValues): StaffUpdate => toProfile(values);
