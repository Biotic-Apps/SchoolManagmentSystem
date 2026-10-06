import type { DetailItem } from "@/components/shared/DetailList";
import { GENDER_OPTIONS, optionName } from "@/features/people/options";
import { formatDate, textOrDash } from "@/lib/format";
import type { StudentDetail } from "./types";

export function profileItems(student: StudentDetail): DetailItem[] {
  return [
    { label: "First name", value: textOrDash(student.firstName) },
    { label: "Last name", value: textOrDash(student.lastName) },
    { label: "Date of birth", value: formatDate(student.dob) },
    { label: "Gender", value: textOrDash(optionName(GENDER_OPTIONS, student.gender)) },
    { label: "B-Form", value: textOrDash(student.bForm) },
    { label: "Address", value: textOrDash(student.address) },
    { label: "Admission date", value: formatDate(student.admissionDate) },
    { label: "Branch", value: textOrDash(student.enrollment?.branchName ?? student.branchName) },
    { label: "Session", value: textOrDash(student.enrollment?.sessionName) },
  ];
}

/** Null when the caller may not see health data (the API omits it without health.view). */
export function medicalItems(student: StudentDetail): DetailItem[] | null {
  const medical = student.medical;
  if (!medical) return null;
  return [
    { label: "Allergies", value: textOrDash(medical.allergies) },
    { label: "Conditions", value: textOrDash(medical.conditions) },
    { label: "Notes", value: textOrDash(medical.notes) },
  ];
}
