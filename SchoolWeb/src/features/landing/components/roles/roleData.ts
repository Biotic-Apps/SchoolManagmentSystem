import {
  Banknote,
  BookOpen,
  Building2,
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  Database,
  FileText,
  GraduationCap,
  HardDrive,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Receipt,
  School,
  Settings,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface RoleMenuItem {
  label: string;
  icon: LucideIcon;
}

export interface LandingRole {
  id: string;
  name: string;
  /** One short line under the name in the role list. */
  tagline: string;
  icon: LucideIcon;
  abilities: string[];
  /** Mini sidebar shown in the mock portal (first item is drawn as active). */
  menu: RoleMenuItem[];
}

export const LANDING_ROLES: LandingRole[] = [
  {
    id: "super-admin",
    name: "Super admin",
    tagline: "All schools, branches and setup",
    icon: ShieldCheck,
    abilities: [
      "Manage every school and branch from one login",
      "Set up sessions, classes, roles and permissions",
      "Create principals and staff accounts",
      "Schedule backups and restore data safely",
      "See activity across the whole organisation",
    ],
    menu: [
      { label: "Schools", icon: Building2 },
      { label: "Branches", icon: School },
      { label: "Users & roles", icon: UserCog },
      { label: "Backups", icon: HardDrive },
      { label: "Settings", icon: Settings },
    ],
  },
  {
    id: "principal",
    name: "Principal",
    tagline: "Whole-school overview and approvals",
    icon: School,
    abilities: [
      "Live overview of attendance, fees and results",
      "Approve leave, results and important changes",
      "Publish the timetable to every class",
      "Publish results and report cards to parents",
      "Send notices to staff and families",
    ],
    menu: [
      { label: "Overview", icon: LayoutDashboard },
      { label: "Approvals", icon: ClipboardCheck },
      { label: "Timetable", icon: CalendarDays },
      { label: "Results", icon: ChartColumn },
      { label: "Notices", icon: MessageSquare },
    ],
  },
  {
    id: "head-teacher",
    name: "Head teacher",
    tagline: "Steps in for any teacher by proxy",
    icon: UserCog,
    abilities: [
      "Mark attendance on behalf of an absent teacher",
      "Write diary and homework for any class",
      "Enter and correct marks by proxy",
      "Every proxy action is logged with your name",
    ],
    menu: [
      { label: "Classes", icon: Users },
      { label: "Proxy attendance", icon: UserCheck },
      { label: "Diary", icon: NotebookPen },
      { label: "Marks", icon: ChartColumn },
    ],
  },
  {
    id: "coordinator",
    name: "Coordinator",
    tagline: "Reviews work and timetable drafts",
    icon: ClipboardCheck,
    abilities: [
      "Approve diary and homework from probation teachers",
      "Send work back with comments to improve",
      "Prepare timetable drafts for the principal",
      "Keep an eye on class progress each week",
    ],
    menu: [
      { label: "Review queue", icon: ClipboardCheck },
      { label: "Teachers", icon: Users },
      { label: "Timetable drafts", icon: CalendarDays },
      { label: "Class progress", icon: ChartColumn },
    ],
  },
  {
    id: "teacher",
    name: "Teacher",
    tagline: "Attendance, diary, homework, marks",
    icon: GraduationCap,
    abilities: [
      "Take attendance in a few taps",
      "Write the daily diary and set homework",
      "Enter exam and test marks",
      "Message parents of your class directly",
      "Works offline on Android and syncs later",
    ],
    menu: [
      { label: "Attendance", icon: UserCheck },
      { label: "Diary", icon: NotebookPen },
      { label: "Homework", icon: BookOpen },
      { label: "Marks", icon: ChartColumn },
      { label: "Messages", icon: MessageSquare },
    ],
  },
  {
    id: "accountant",
    name: "Accountant",
    tagline: "Fees, challans, payroll and expenses",
    icon: Wallet,
    abilities: [
      "Generate fee challans for a class in one go",
      "Collect fees and print receipts instantly",
      "Track dues, discounts and late fines",
      "Run monthly payroll for all staff",
      "Record expenses and see the balance",
    ],
    menu: [
      { label: "Fees", icon: Wallet },
      { label: "Challans", icon: FileText },
      { label: "Receipts", icon: Receipt },
      { label: "Payroll", icon: Banknote },
      { label: "Expenses", icon: Database },
    ],
  },
  {
    id: "parent",
    name: "Parent",
    tagline: "Your child's day, in your pocket",
    icon: Users,
    abilities: [
      "See attendance, diary and homework every day",
      "View results and report cards",
      "Download and check fee challans",
      "Message teachers and read school notices",
      "Switch between children; sign in with an email code",
    ],
    menu: [
      { label: "Attendance", icon: UserCheck },
      { label: "Diary", icon: NotebookPen },
      { label: "Results", icon: ChartColumn },
      { label: "Fee challans", icon: FileText },
      { label: "Messages", icon: MessageSquare },
    ],
  },
];
