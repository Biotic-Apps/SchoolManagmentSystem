import { FileSpreadsheet, KeyRound, School, Smartphone, type LucideIcon } from "lucide-react";

export interface LandingStep {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the icon tile. */
  gradient: string;
}

export const LANDING_STEPS: LandingStep[] = [
  {
    title: "Set up your school in one form",
    description: "Enter your school, branches, session and classes once. eSchool prepares everything else.",
    icon: School,
    gradient: "from-[#6A5ACD] to-[#7B68EE]",
  },
  {
    title: "Add students, staff & classes",
    description: "Type them in or import your existing Excel sheets in a few minutes.",
    icon: FileSpreadsheet,
    gradient: "from-[#7B68EE] to-[#A78BFA]",
  },
  {
    title: "Share logins",
    description: "Each role gets its own portal: principal, teachers, accountant and parents.",
    icon: KeyRound,
    gradient: "from-[#38BDF8] to-[#7B68EE]",
  },
  {
    title: "Run the school every day",
    description: "Attendance, diary, fees and results on the web and Android, even when offline.",
    icon: Smartphone,
    gradient: "from-[#A78BFA] to-[#FB7185]",
  },
];
