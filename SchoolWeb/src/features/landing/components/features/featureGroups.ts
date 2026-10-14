import {
  Award, Banknote, BellRing, BookCheck, BookOpen, Boxes, BriefcaseBusiness, CalendarCheck, CalendarClock,
  ChartColumn, ClipboardCheck, Contact, DatabaseBackup, DoorOpen, FileQuestionMark, FileSpreadsheet, FileText,
  GitBranch, GraduationCap, HandCoins, Handshake, HeartPulse, IdCard, KeyRound, Landmark, Layers, Megaphone,
  MessageSquareWarning, MessagesSquare, NotebookPen, Palette, PartyPopper, Receipt, Rocket, ScanSearch, School,
  ScrollText, Settings2, ShieldCheck, Smartphone, UserCheck, UserPlus, Users, UsersRound, Wallet,
  type LucideIcon,
} from "lucide-react";

export type FeatureGroupId = "admin" | "people" | "academics" | "operations" | "finance" | "communication";

export interface FeatureModule {
  icon: LucideIcon;
  title: string;
  benefit: string;
}

export interface FeatureGroup {
  id: FeatureGroupId;
  label: string;
  icon: LucideIcon;
  pitch: string;
  modules: FeatureModule[];
}

/** Every real module of eSchool, grouped the way the features tab bar shows them. */
export const featureGroups: FeatureGroup[] = [
  {
    id: "admin",
    label: "Admin & setup",
    icon: Settings2,
    pitch: "Go live in an afternoon. One form creates your school, main branch, principal, session and classes — then roles, branding and backups keep it running safely.",
    modules: [
      { icon: Rocket, title: "One-form school setup", benefit: "School, main branch, principal, session and classes created in one go." },
      { icon: GitBranch, title: "Branches & sessions", benefit: "Run many campuses and academic years from one account." },
      { icon: Layers, title: "Classes, sections & subjects", benefit: "Build your class structure once and reuse it every year." },
      { icon: KeyRound, title: "Roles & permissions", benefit: "Everyone sees exactly what their job needs — nothing more." },
      { icon: Palette, title: "School branding", benefit: "Your logo and colour on every screen, report and receipt." },
      { icon: FileSpreadsheet, title: "Excel data import", benefit: "Bring students, staff and fees over from your spreadsheets." },
      { icon: DatabaseBackup, title: "Encrypted backups", benefit: "Your data is backed up and locked with encryption." },
      { icon: ScrollText, title: "Audit history", benefit: "See who changed what, and when, on every record." },
    ],
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    pitch: "From the first admission form to a teacher's confirmation, every student, family and staff member lives in one clean profile.",
    modules: [
      { icon: UserPlus, title: "Online admissions", benefit: "Parents apply online; you review and approve in a click." },
      { icon: IdCard, title: "Student profiles", benefit: "Class, documents, attendance and results on one page." },
      { icon: UsersRound, title: "Guardians & families", benefit: "Link siblings to one family for simpler contact and fees." },
      { icon: BriefcaseBusiness, title: "Staff & teachers", benefit: "Hire with a probation workflow and approvals built in." },
      { icon: UserCheck, title: "Staff attendance", benefit: "Daily staff check-ins that feed straight into payroll." },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    pitch: "Plan the year, teach every day and publish results — timetables, diaries, homework and exams all connected.",
    modules: [
      { icon: CalendarClock, title: "Timetable", benefit: "Draft it, check clashes, then publish to every class." },
      { icon: BookOpen, title: "Syllabus", benefit: "Track what's planned and what's covered, subject by subject." },
      { icon: NotebookPen, title: "Daily diary", benefit: "Teachers post the day's notes; parents read them at home." },
      { icon: ClipboardCheck, title: "Homework", benefit: "Assign, collect and review work without paper." },
      { icon: FileQuestionMark, title: "Question bank", benefit: "Reuse your best questions to build papers in minutes." },
      { icon: BookCheck, title: "Exams & results", benefit: "Enter marks once — grades and positions calculate themselves." },
      { icon: FileText, title: "Report cards with skills", benefit: "Printable report cards with marks and skills remarks." },
      { icon: Award, title: "Certificates", benefit: "Issue leaving, character and achievement certificates." },
    ],
  },
  {
    id: "operations",
    label: "Daily operations",
    icon: School,
    pitch: "The busy parts of a school day, made calm — attendance that works offline, safe pickups, and a clear place for every concern.",
    modules: [
      { icon: CalendarCheck, title: "Student attendance", benefit: "Mark a class in seconds — even offline on Android." },
      { icon: PartyPopper, title: "Activities & events", benefit: "Plan trips, sports days and functions on a shared calendar." },
      { icon: Handshake, title: "Meetings", benefit: "Schedule parent and staff meetings with notes kept on file." },
      { icon: HeartPulse, title: "Health records", benefit: "Allergies, conditions and check-ups ready when needed." },
      { icon: DoorOpen, title: "Pickup / gate pass", benefit: "Only approved guardians collect a child, with a logged pass." },
      { icon: MessageSquareWarning, title: "Complaints", benefit: "Every role can raise a concern and follow it to closure." },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    pitch: "Know where every payment goes. Fees, payroll, expenses and stock roll up into accounts and reports you can trust.",
    modules: [
      { icon: Receipt, title: "Fees, challans & receipts", benefit: "Set fee structures, print challans and issue receipts." },
      { icon: HandCoins, title: "Family fees", benefit: "One combined bill for all the children in a family." },
      { icon: ScanSearch, title: "Payment proof check", benefit: "Parents upload proof; accounts verify before it's marked paid." },
      { icon: Banknote, title: "Payroll", benefit: "Salaries from attendance and allowances, with payslips." },
      { icon: Wallet, title: "Expenses", benefit: "Record bills and spending by category and branch." },
      { icon: Landmark, title: "Accounts", benefit: "Income and spending in one ledger, always balanced." },
      { icon: Boxes, title: "Inventory", benefit: "Track books, uniforms and supplies in and out of stock." },
      { icon: ChartColumn, title: "Reports", benefit: "Collections, dues and spending at a glance, ready to print." },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: MessagesSquare,
    pitch: "Keep families close. Parents follow every child from one portal, and the right people hear about what matters.",
    modules: [
      { icon: MessagesSquare, title: "Parent–teacher messaging", benefit: "Private, simple chats between parents and teachers." },
      { icon: BellRing, title: "Email & SMS alerts", benefit: "Absences, fees and results reach parents instantly." },
      { icon: Smartphone, title: "Parent portal", benefit: "One login for all children, with a quick child switcher." },
      { icon: Megaphone, title: "Announcements", benefit: "Share news with the whole school, a class or a branch." },
    ],
  },
];

/** Small extras shown as chips under the panel. */
export const featureExtras: { icon: LucideIcon; label: string }[] = [
  { icon: CalendarClock, label: "12-hour time everywhere" },
  { icon: ShieldCheck, label: "Two-step sign in" },
  { icon: Contact, label: "Email code login for parents" },
  { icon: FileText, label: "Printable PDFs" },
  { icon: GitBranch, label: "Multi-branch" },
];
