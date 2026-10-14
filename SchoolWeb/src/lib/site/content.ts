import { BRAND, brandCopyright } from "@/lib/brand";

/**
 * Every string on the marketing site lives here so copy can be reviewed and
 * changed in one place. Components read from this file; they never hardcode.
 *
 * Product facts (module list, VAT rate, fiscal year, ledger example, session
 * behaviour) come from the deep-dive audit of the live app — they are real,
 * not invented.
 *
 * The one thing this file does NOT own is the product's NAME. The site used to
 * spell "Auditwithus" out in five places here, which was fine while the site was
 * its own repo and is not now: the app treats `lib/brand.ts` as the single
 * source of the name, so "a rebrand is one edit there, not a find-and-replace".
 * Five literals in here would have been five places the rebrand missed, and the
 * site would go on printing the old name in the footer, the OG description and
 * the FAQ. The SENTENCES still live here — only the name is interpolated.
 */

export const SITE = {
  name: BRAND,
  tagline: "Run your whole school from one place.",
  subline:
    "Admissions · Attendance · Exams · Fees · Payroll · Parent portal. One web portal and an Android app for every school in Pakistan.",
  description: `${BRAND} is school management software for Pakistani schools: admissions, attendance, exams and report cards, fee challans, payroll and a parent portal, on the web and on Android.`,
  // Same helper the app's login footer uses, so the two cannot word it
  // differently. The year stays a literal: `new Date()` at module scope is a
  // value the server and the client can disagree about across a new-year
  // boundary, and this string is rendered on the server.
  copyright: brandCopyright(2026),
} as const;

/** Chrome: the header, the mobile sheet and anything else that frames a page. */
export const NAV_COPY = {
  homeLabel: `${BRAND} home`,
  primaryLabel: "Primary",
  menuLabel: "Site menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  signIn: "Sign in",
  contact: "Contact us",
  skipToContent: "Skip to content",
  /** Appended, visually hidden, to any link that leaves for a new tab. */
  newTab: "(opens in a new tab)",
  /** Footer: the one-line description under the logo, and the maker credit. */
  footerBlurb:
    "School management for Pakistani schools, from admissions to report cards, fees to payroll, and a portal for every parent.",
  madeBy: "Made by",
  backToTop: "Back to top",
  /** Footer: the short line beside the columns, above the wordmark. */
  footerNote: "One system for the whole school.",
  writeToUs: "Write to us",
} as const;

/** The three proof points printed under the hero buttons. */
export const HERO_PROOFS = [
  "Role-based portals",
  "Works offline on Android",
  "Parents stay in the loop",
] as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const HERO_COPY = {
  badge: "Built for schools in Pakistan",
  headline: "Run your whole school from one place.",
  /** Static first line of the visual headline; the second line rotates. */
  headlineLead: "Run your whole school",
  rotating: ["attendance.", "fees & challans.", "exams & results.", "parent messages."],
  chipAttendance: "Attendance saved · 5-A",
  chipAttendanceMeta: "38 present · 2 absent",
  chipFee: "Fee received Rs 8,500",
  chipFeeMeta: "Challan FC-10482 · Paid",
  subline:
    "Admissions, attendance, timetable, homework, exams and report cards, fees and payroll, on the web and on Android, with a portal for every role.",
  signIn: "Sign in",
  secondary: "See how it works",
} as const;

/**
 * Facts, not claims.
 *
 * A young product cannot honestly show a customer count or a logo wall, and a
 * fabricated one is worse than none. What it can show is exactly what it
 * handles — which is what a principal is weighing up anyway.
 */
export const HERO_CAPABILITY = [
  { figure: "30+", label: "modules, one sign-in" },
  { figure: "7", label: "roles, each with its own portal" },
  { figure: "Offline", label: "attendance on Android" },
  { figure: "Rs", label: "challans, receipts & family fees" },
] as const;

/* ------------------------------------------------------------------ */
/* Section headings                                                    */
/* ------------------------------------------------------------------ */

export const STATS_COPY = {
  eyebrow: "At a glance",
  title: "Your whole school at a glance",
  body: "Students, attendance, fees, staff and everything waiting for your approval: the figures the principal's dashboard opens with, current to the last entry.",
  panelTitle: "School overview",
  panelMeta: "Session 2026-27 · All branches · Updated 9:30 AM",
  disclaimer: "Figures shown are illustrative. Your dashboard reads your own school's records.",
  ringTitle: "Attendance today",
  ringCaption: "Marked from classrooms on phones and the web, synced the moment it is saved.",
  ringPresent: "Present",
  ringPresentValue: "1,198",
  ringAbsent: "Absent or on leave",
  ringAbsentValue: "50",
  tickerTitle: "Live activity",
  tickerLive: "Live",
} as const;

/** Recent events cycled through the stats ticker card, newest last. */
export const STATS_TICKER = [
  { text: "Class 5-A attendance saved", meta: "Ms. Hina · 8:05 AM", kind: "attendance" },
  { text: "Challan FC-10482 paid", meta: "Rs 8,500 · Khan family", kind: "fees" },
  { text: "Report cards published for Grade 7", meta: "Mid-term · 124 students", kind: "results" },
  { text: "Homework posted for Class 3-B", meta: "Mathematics · Daily diary", kind: "homework" },
  { text: "Admission approved, Hamza Ali", meta: "Class 1 · Main Campus", kind: "admissions" },
  { text: "Absence alert sent to 6 parents", meta: "SMS and app · 8:20 AM", kind: "messages" },
] as const;

export const HOW_COPY = {
  eyebrow: "How it works",
  title: "Three steps, and your school is running",
  body: "No long setup project and no training course. Fill in one form, bring in your people, and everyone signs in to the part of the school that is theirs.",
  /** Labels for the small illustrations inside each timeline card. */
  setupItems: ["School name & logo", "Branches", "Session: April to March", "Fee basics"],
  importFile: "students.xlsx",
  importRows: [
    { name: "Ayesha Khan", cls: "5-B", guardian: "Imran Khan" },
    { name: "Hamza Ali", cls: "5-B", guardian: "Sajid Ali" },
    { name: "Fatima Noor", cls: "6-A", guardian: "Noor Ahmed" },
    { name: "Usman Tariq", cls: "7-C", guardian: "Tariq Mehmood" },
  ],
  roles: ["Principal", "Teacher", "Accountant", "Parent"],
} as const;

export const TRUST_COPY = {
  eyebrow: "Security & control",
  title: "Student records you can stand behind",
  body: "Every account is created by the school, every action is checked against a role, and every change leaves a trail. Parents trust you with their children's details, and the system is built to keep that trust.",
} as const;

export const PAKISTAN_COPY = {
  eyebrow: "Built for Pakistan",
  title: "Made for how Pakistani schools actually run",
  body: "Not a foreign package with the currency swapped. Fees in rupees, a session that starts in April, SMS for parents on basic phones, and an Android app that keeps working when the internet does not.",
  /** The local touches that scroll past in the marquee strip. */
  touches: ["Rs", "JazzCash", "Easypaisa", "Bank challans", "Urdu-friendly names", "April-March session", "12-hour time", "SMS alerts"],
} as const;

export const FLOW_COPY = {
  eyebrow: "One tap, three people informed",
  title: "Attendance that tells the right people, right away",
  body: "A teacher marks the register once. The parent of an absent child hears about it in minutes, and the principal's dashboard is already up to date. No phone calls, no paper slips, no end-of-day tally.",
  steps: {
    teacher: "Teacher marks attendance",
    parent: "Parent is notified",
    principal: "Principal's dashboard",
  },
  present: "Present",
  absent: "Absent",
  late: "Late",
  saved: "Saved",
  smsFrom: "eSchool",
  smsTime: "Just now",
  pushTitle: "Absence alert",
  dashboardTitle: "Today's attendance",
  presentLabel: "Present",
  absentLabel: "Absent",
  lateLabel: "Late",
  updated: "Updated",
  alertsSent: "Absence alerts sent to parents:",
  offlineNote:
    "No signal in the classroom? The Android app keeps the register on the phone and syncs it, and sends the alerts, as soon as it is back online.",
} as const;

export const MODULES_COPY = {
  eyebrow: "Module map",
  title: "Eighteen modules, one sign-in",
  body: "Not a bundle of separate apps stitched together. Every module shares the same students, families, staff and sessions, and respects the same roles and branches.",
  onTheWay: "On the way",
  soon: "Soon",
  filterLabel: "Show modules for",
  filters: [
    { id: "all", label: "All" },
    { id: "principal", label: "Principal" },
    { id: "teacher", label: "Teacher" },
    { id: "accountant", label: "Accountant" },
    { id: "parent", label: "Parent" },
  ],
  /** Read out after a filter changes, e.g. "10 modules shown". */
  shown: "modules shown",
} as const;

export const FAQ_COPY = {
  eyebrow: "Questions",
  title: "Answers before you ask",
  body: `What principals, accountants and parents usually want to know before a school moves onto ${BRAND}.`,
  /** The little chat beside the questions. */
  chatFrom: "A parent",
  chatQuestion: "Can I see my son's attendance and fees on my phone?",
  chatReplyFrom: BRAND,
  chatReply: "Yes, every day. Sign in with his admission number.",
  chatMore: "More answers are right here",
} as const;

export const CTA_COPY = {
  eyebrow: "Get started",
  title: "Ready to open your school's portal?",
  body: "Already set up? Sign in to your school's portal. New to eSchool? Get in touch and we will set it up with your branches, classes, staff and fee structure.",
  signIn: "Sign in",
  contact: "Contact us",
} as const;

export const ATTENDANCE_COPY = {
  eyebrow: "Attendance & daily diary",
  title: "The school day, recorded as it happens",
  body: "Registers, diary entries and homework go in from the classroom on a phone or the web portal, and parents see them the same day, without a single paper slip going home.",
} as const;

export const ACADEMICS_COPY = {
  eyebrow: "Exams, results & report cards",
  title: "From marks entry to a printed report card",
  body: "Teachers enter marks once. Grades, positions and skills are worked out for them, coordinators approve, and the report card is ready to print or share with parents.",
} as const;

export const FEES_COPY = {
  eyebrow: "Fees, challans & payroll",
  title: "Every rupee in and out, accounted for",
  body: "Fee structures, family challans, payment proofs and receipts on one side; payroll and expenses on the other. The accountant sees the whole picture, and the principal sees the summary.",
} as const;

export const PARENT_COPY = {
  eyebrow: "Parent portal",
  title: "Parents stay close without calling the office",
  body: "One sign-in for every child in the family. Attendance, homework, results, fee challans and messages to teachers, on the web or the Android app.",
} as const;

/** The contact form — every label, placeholder and outcome it can report. */
export const CONTACT_COPY = {
  nameLabel: "Your name",
  namePlaceholder: "Ayesha Khan",
  emailLabel: "Email",
  emailPlaceholder: "you@yourschool.edu.pk",
  schoolLabel: "School name",
  schoolPlaceholder: "e.g. Al-Noor Public School, Lahore",
  messageLabel: "Tell us about your school",
  messagePlaceholder:
    "How many campuses and students you have, what you use today, and what you would like eSchool to handle.",
  submit: "Send message",
  sending: "Sending",
  sentTitle: "Thank you, that reached us.",
  sentBody:
    "We will reply to the address you gave. If it is urgent, email us at hello@pixdevelop.com and mention your school's name.",
  sendAnother: "Send another message",
  failure: "We could not send that just now. Please email us at hello@pixdevelop.com instead.",
  tooMany: "That is a lot of messages in a short time. Please try again in a minute.",
} as const;

/* ------------------------------------------------------------------ */
/* Section 1 — the dashboard's six stat tiles                          */
/* ------------------------------------------------------------------ */

export type StatTile = {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  /** Fractional digits — a percentage keeps 1, counts and money keep 0. */
  decimals: number;
  caption: string;
  tone: "indigo" | "rose" | "blue" | "sky" | "violet";
  icon: "students" | "attendance" | "fees" | "approvals" | "staff" | "homework";
  /** Last seven school days, oldest first — drawn as the tile's sparkline. */
  trend: readonly number[];
};

export const STAT_TILES: StatTile[] = [
  {
    label: "Students enrolled",
    value: 1248,
    prefix: "",
    suffix: "",
    decimals: 0,
    caption: "Across 3 branches · 46 sections",
    tone: "indigo",
    icon: "students",
    trend: [1196, 1204, 1211, 1219, 1230, 1241, 1248],
  },
  {
    label: "Attendance today",
    value: 96,
    prefix: "",
    suffix: "%",
    decimals: 0,
    caption: "1,198 present · 50 absent or on leave",
    tone: "sky",
    icon: "attendance",
    trend: [92.1, 93.4, 91.8, 95.2, 93.9, 94.1, 96],
  },
  {
    label: "Fees collected",
    value: 1845600,
    prefix: "Rs ",
    suffix: "",
    decimals: 0,
    caption: "This month · 1,032 challans paid",
    tone: "violet",
    icon: "fees",
    trend: [420, 690, 910, 1180, 1390, 1620, 1845],
  },
  {
    label: "Pending approvals",
    value: 14,
    prefix: "",
    suffix: "",
    decimals: 0,
    caption: "Admissions, payment proofs & probation work",
    tone: "rose",
    icon: "approvals",
    trend: [22, 19, 24, 17, 18, 15, 14],
  },
  {
    label: "Staff present",
    value: 86,
    prefix: "",
    suffix: "",
    decimals: 0,
    caption: "Of 92 staff · 4 on approved leave",
    tone: "blue",
    icon: "staff",
    trend: [88, 85, 87, 84, 89, 87, 86],
  },
  {
    label: "Homework set",
    value: 212,
    prefix: "",
    suffix: "",
    decimals: 0,
    caption: "This week · posted to the daily diary",
    tone: "indigo",
    icon: "homework",
    trend: [24, 61, 98, 131, 165, 190, 212],
  },
];

/* ------------------------------------------------------------------ */
/* Section 2 — how it works                                            */
/* ------------------------------------------------------------------ */

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Set up your school in one form",
    body: "School name, logo, branches, session dates and fee basics, entered once, on one form. Your branding then appears on every challan, report card and certificate.",
  },
  {
    step: "02",
    title: "Add students, staff & classes",
    body: "Create classes, sections and subjects, then add students, guardians and staff one by one, or import them all from an Excel sheet in a single pass.",
  },
  {
    step: "03",
    title: "Every role signs in to its own portal",
    body: "Principal, coordinators, teachers, accountants and parents each see only their part of the school, on the web portal or the Android app, even when the signal drops.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Section 4 — the attendance flow demo                                */
/* ------------------------------------------------------------------ */

export const FLOW_DEMO = {
  className: "Class 5-B",
  date: "Mon, 14 Oct · 8:05 AM",
  students: [
    { name: "Ayesha Khan", roll: "01", status: "present" },
    { name: "Hamza Ali", roll: "02", status: "absent" },
    { name: "Fatima Noor", roll: "03", status: "present" },
    { name: "Usman Tariq", roll: "04", status: "late" },
    { name: "Zainab Raza", roll: "05", status: "present" },
  ],
  sms: "Dear parent, Hamza Ali (Class 5-B) is marked absent today, Mon 14 Oct. Please contact the school if this is unexpected.",
  absentName: "Hamza Ali",
  sentAt: "8:06 AM",
  totals: { present: 412, absent: 18, late: 9 },
  strength: 439,
} as const;

/* ------------------------------------------------------------------ */
/* Section 7 — module map                                              */
/* ------------------------------------------------------------------ */

/** Named rather than free-form, so the icon map in `Modules` stays exhaustive. */
export type ModuleIcon =
  | "ClipboardList"
  | "Users"
  | "Briefcase"
  | "CalendarCheck"
  | "CalendarClock"
  | "NotebookPen"
  | "FileCheck"
  | "Award"
  | "Receipt"
  | "Wallet"
  | "Landmark"
  | "Package"
  | "MessageSquare"
  | "MessageSquareWarning"
  | "HeartPulse"
  | "BarChart3"
  | "UserRound"
  | "Smartphone";

/** The roles the module map can be filtered by. */
export type ModuleRole = "principal" | "teacher" | "accountant" | "parent";

/** The six tile colours the module map draws its icons in. */
export type ModuleTone = "purple" | "indigo" | "rose" | "blue" | "sky" | "violet";

export type ModuleEntry = {
  name: string;
  detail: string;
  tone: ModuleTone;
  icon: ModuleIcon;
  status: "live" | "soon";
  /** Who uses it day to day; drives the role chips above the module grid. */
  roles: ModuleRole[];
};

export const MODULES: ModuleEntry[] = [
  { name: "Admissions", detail: "Online form · Approvals · Enrolment", tone: "purple", icon: "ClipboardList", status: "live", roles: ["principal"] },
  { name: "Students & families", detail: "Profiles · Guardians · Siblings", tone: "blue", icon: "Users", status: "live", roles: ["principal", "teacher", "accountant"] },
  { name: "Staff & HR", detail: "Staff · Probation reviews · Letters", tone: "indigo", icon: "Briefcase", status: "live", roles: ["principal", "accountant"] },
  { name: "Attendance", detail: "Students · Staff · Offline on Android", tone: "sky", icon: "CalendarCheck", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Timetable", detail: "Draft · Publish · Classes & subjects", tone: "violet", icon: "CalendarClock", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Diary & homework", detail: "Daily diary · Homework · Syllabus", tone: "rose", icon: "NotebookPen", status: "live", roles: ["teacher", "parent"] },
  { name: "Exams & results", detail: "Question bank · Marks · Results", tone: "purple", icon: "FileCheck", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Report cards & certificates", detail: "Printable cards · Skills · Certificates", tone: "indigo", icon: "Award", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Fees & challans", detail: "Structures · Family fees · Receipts", tone: "blue", icon: "Receipt", status: "live", roles: ["principal", "accountant", "parent"] },
  { name: "Payroll", detail: "Salaries · Deductions · Payslips", tone: "rose", icon: "Wallet", status: "live", roles: ["principal", "accountant"] },
  { name: "Expenses & accounts", detail: "Expenses · Income · Payment proofs", tone: "sky", icon: "Landmark", status: "live", roles: ["principal", "accountant"] },
  { name: "Inventory", detail: "Items · Stock · Issue & return", tone: "violet", icon: "Package", status: "live", roles: ["principal", "accountant"] },
  { name: "Messaging & notifications", detail: "Parent-teacher chat · Email · SMS", tone: "purple", icon: "MessageSquare", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Complaints & meetings", detail: "Complaints for every role · Meetings", tone: "rose", icon: "MessageSquareWarning", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Health & pickup", detail: "Health records · Gate pass · Events", tone: "sky", icon: "HeartPulse", status: "live", roles: ["principal", "teacher", "parent"] },
  { name: "Reports", detail: "Fees · Attendance · Results · Audit", tone: "indigo", icon: "BarChart3", status: "live", roles: ["principal", "accountant"] },
  { name: "Parent portal", detail: "Child switcher · Fees · Diary · Results", tone: "blue", icon: "UserRound", status: "live", roles: ["parent"] },
  { name: "Android app", detail: "Every role · Works on patchy internet", tone: "violet", icon: "Smartphone", status: "live", roles: ["principal", "teacher", "accountant", "parent"] },
];

/* ------------------------------------------------------------------ */
/* Section 8 — built for Pakistan                                      */
/* ------------------------------------------------------------------ */

export const PAKISTAN_FACTS = [
  { value: "Rs", icon: "Banknote", label: "Rupees and local challans", body: "Fees, receipts and payroll in Rs, with printable bank-style fee challans and family challans for siblings." },
  { value: "Apr-Mar", icon: "CalendarRange", label: "Your academic session", body: "Sessions run April to March by default, and classes, fees and results all follow the session you set." },
  { value: "12-hour", icon: "Clock", label: "Times the way you say them", body: "Timetables, attendance and gate passes read 8:00 AM and 1:30 PM, never a 24‑hour clock." },
  { value: "SMS", icon: "MessageSquareText", label: "Reaches every parent", body: "Fee reminders and absence alerts go by SMS too, so parents on basic phones are never left out." },
  { value: "Offline", icon: "WifiOff", label: "Low-end Android, patchy internet", body: "Teachers mark attendance with no signal; it saves on the phone and syncs once the connection is back." },
  { value: "Branches", icon: "Building2", label: "Built for school chains", body: "Run every campus from one account, with each branch keeping its own classes, staff, fees and reports." },
] as const;

/* ------------------------------------------------------------------ */
/* Section 9 — trust                                                   */
/* ------------------------------------------------------------------ */

export const TRUST_POINTS = [
  {
    title: "Permissions, deny by default",
    body: "Every role starts with nothing and is granted only what it needs. A teacher sees their own classes; an accountant sees fees, not marks. Checks run on the server, not just on the screen.",
    icon: "ShieldCheck",
  },
  {
    title: "Only school accounts sign in",
    body: "There is no public sign-up. Every account is created by the school, and two-step verification with an authenticator app protects the accounts that matter most.",
    icon: "KeyRound",
  },
  {
    title: "Encrypted backups, tested restores",
    body: "Backups are encrypted, and each one is checked by restoring it, so the backup you are counting on is one that actually works.",
    icon: "DatabaseBackup",
  },
  {
    title: "Full audit history",
    body: "Who changed a mark, a fee or a student record, and when, is kept on file. History is never quietly rewritten.",
    icon: "History",
  },
  {
    title: "Auto sign-out when idle",
    body: "A session left open on a shared office computer signs itself out after a period of inactivity, so the next person cannot carry on as you.",
    icon: "MonitorSmartphone",
  },
  {
    title: "Private by design",
    body: "Parents see only their own children, and staff see only their own branch. Student data is never shared outside your school.",
    icon: "Lock",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Section 10 — FAQ                                                    */
/* ------------------------------------------------------------------ */

export const FAQ = [
  {
    q: "Who can sign in?",
    a: "Super admins, principals, head teachers, coordinators, teachers, accountants and parents, each with their own role and permissions. Students do not have a login; parents follow their child's progress instead. Every account is created by the school, so there is no public sign-up.",
  },
  {
    q: "How do parents sign in?",
    a: "With their child's admission number and a password, or with a one-time code sent to their email. A parent with more than one child at the school switches between them from a single account.",
  },
  {
    q: "Does the Android app work without internet?",
    a: "Yes, for attendance. Teachers can mark attendance with no connection; it is saved on the phone and synced automatically once the internet is back. The app is built to run well on low-end Android phones.",
  },
  {
    q: "Can we run more than one branch?",
    a: "Yes. A school chain runs every campus from one account. Each branch keeps its own classes, staff, fees and reports, while the owner can see all of them together.",
  },
  {
    q: "Can we bring in our existing student data?",
    a: "Yes. Students, families and staff can be imported from an Excel sheet, so years of records do not have to be typed in by hand. Setting up the school itself is a single form.",
  },
  {
    q: "Is our school's data safe?",
    a: "Access is granted by role and denied by default, important accounts can use two-step verification, every change is recorded in the audit history, and backups are encrypted and checked by restoring them. Your data is never shared outside your school.",
  },
  {
    q: "Can we print report cards and fee challans?",
    a: "Yes. Report cards with marks, grades and skills, certificates, fee challans, family challans and receipts are all printable, carrying your school's own name, logo and colours.",
  },
  {
    q: "What if someone forgets their password?",
    a: "Use \"Forgot password\" on the sign-in page to get a reset code by email. Parents can also sign in with an email code instead of a password, and an administrator can reset any staff account.",
  },
  {
    q: `How do we get ${BRAND} for our school?`,
    a: "Get in touch through the contact page or write to hello@pixdevelop.com. We set your school up (branches, sessions, classes and staff) and hand over the accounts. If your school already uses it, sign in from the button above.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Feature showcases (pinned scroll device blocks)                     */
/* ------------------------------------------------------------------ */

export const ATTENDANCE_POINTS = [
  { title: "Mark a class in a minute", body: "Present, absent, late or on leave: one tap per student, with the whole class pre-filled as present." },
  { title: "Works without signal", body: "The Android app saves the register offline and syncs it the moment the phone is back online." },
  { title: "Daily diary and homework", body: "Teachers post the day's diary and homework per class and subject, with due dates parents can see." },
  { title: "Staff attendance too", body: "Teachers' own check-ins sit alongside the student registers, ready for payroll at month end." },
];

export const ACADEMICS_POINTS = [
  { title: "Exams on a schedule", body: "Set terms, papers and total marks per class and subject, and draw questions from the school's question bank." },
  { title: "Marks entry, then approval", body: "Teachers enter marks; work from teachers on probation goes to the coordinator or principal to approve." },
  { title: "Results worked out for you", body: "Percentages, grades and class positions are calculated the moment marks are saved, so no spreadsheets." },
  { title: "Report cards worth printing", body: "Printable report cards with skills and remarks, in your school's branding, plus certificates when needed." },
];

export const FEES_POINTS = [
  { title: "Fee structures per class", body: "Tuition, admission, transport and other heads set once per class and session, with sibling discounts applied." },
  { title: "Family challans", body: "One challan for all the children in a family, printed or shared with parents, with due dates and late fines." },
  { title: "Payment proofs verified", body: "Parents upload a bank or wallet receipt; the accountant verifies it and the receipt is issued in Rs." },
  { title: "Payroll and expenses", body: "Salaries from staff attendance, school expenses and accounts in one place, reported per branch." },
];

export const PARENT_POINTS = [
  { title: "Every child, one sign-in", body: "A child switcher moves between brothers and sisters, even across branches of the same school." },
  { title: "Sign in their way", body: "Admission number and password, or a one-time code sent to their email, with two-step verification if they want it." },
  { title: "The whole school day", body: "Attendance, diary, homework, timetable and results for each child, updated as teachers save them." },
  { title: "Fees and messages", body: "See and pay challans, upload payment proof, and message the class teacher directly." },
];
