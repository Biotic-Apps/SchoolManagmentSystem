/** Demo data printed on the sample documents. Fictional school and family. */
export const DEMO_SCHOOL = {
  name: "Bright Future School",
  campus: "Gulberg Campus, Lahore",
  session: "Session 2026-27",
} as const;

export const DEMO_STUDENT = {
  name: "Aiman Fatima",
  father: "Muhammad Imran",
  className: "Class 7-B",
  rollNo: "14",
  admissionNo: "BFS-2024-0187",
  blood: "B+",
  validTill: "Mar 2027",
  emergency: "0300 1234567",
} as const;

export const REPORT_SUBJECTS = [
  { name: "English", total: 100, marks: 86, grade: "A" },
  { name: "Urdu", total: 100, marks: 82, grade: "A" },
  { name: "Mathematics", total: 100, marks: 91, grade: "A+" },
  { name: "General Science", total: 100, marks: 88, grade: "A" },
  { name: "Social Studies", total: 100, marks: 79, grade: "B+" },
  { name: "Islamiat", total: 100, marks: 90, grade: "A+" },
  { name: "Computer", total: 100, marks: 94, grade: "A+" },
] as const;

export const REPORT_SUMMARY = { obtained: 610, total: 700, percent: "87.1%", grade: "A", position: "3rd" } as const;

export const REPORT_SKILLS = [
  { name: "Punctuality", stars: 5 },
  { name: "Neatness", stars: 4 },
  { name: "Class participation", stars: 5 },
  { name: "Behaviour", stars: 5 },
] as const;

export const REPORT_REMARKS =
  "Aiman is attentive, neat and always ready to help classmates. Keep reading every day.";

export const CHALLAN = {
  number: "FC-2026-10-0457",
  family: "FAM-0093",
  month: "October 2026",
  due: "15 Oct 2026",
  bank: "Meezan Bank, A/C 0211-0104-5567",
  children: [
    { name: "Aiman Fatima", className: "7-B", amount: 8500 },
    { name: "Hamza Imran", className: "4-A", amount: 7650 },
    { name: "Zainab Imran", className: "KG-2", amount: 6800 },
  ],
  total: 22950,
  copies: ["Bank copy", "School copy", "Parent copy"],
} as const;

export const CERTIFICATE = {
  title: "Certificate of Achievement",
  lead: "This certificate is proudly presented to",
  reason: "for securing First Position in the Inter-House Science Fair 2026",
  date: "2 Oct 2026",
} as const;

export const rs = (n: number) => `Rs ${n.toLocaleString("en-US")}`;
