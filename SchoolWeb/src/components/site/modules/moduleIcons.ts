import {
  Award,
  BarChart3,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  FileCheck,
  HeartPulse,
  Landmark,
  MessageSquare,
  MessageSquareWarning,
  NotebookPen,
  Package,
  Receipt,
  Smartphone,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ModuleIcon, ModuleTone } from "@/lib/site/content";

/**
 * Named explicitly rather than looked up off the namespace: a namespace import
 * pulls the whole lucide barrel, and the map turns an unknown icon name into a
 * type error instead of a silent square.
 */
export const MODULE_ICONS: Record<ModuleIcon, LucideIcon> = {
  ClipboardList,
  Users,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  NotebookPen,
  FileCheck,
  Award,
  Receipt,
  Wallet,
  Landmark,
  Package,
  MessageSquare,
  MessageSquareWarning,
  HeartPulse,
  BarChart3,
  UserRound,
  Smartphone,
};

/** Each tone as a gradient disc, always finishing in the brand purple. */
export const TONE_GRADIENTS: Record<ModuleTone, string> = {
  purple: "from-brand-400 to-brand-700 shadow-[0_10px_22px_-10px_rgb(123_104_238/0.8)]",
  indigo: "from-tile-indigo to-brand-700 shadow-[0_10px_22px_-10px_rgb(99_102_241/0.8)]",
  rose: "from-accent-400 to-brand-600 shadow-[0_10px_22px_-10px_rgb(236_72_153/0.7)]",
  blue: "from-tile-blue to-brand-600 shadow-[0_10px_22px_-10px_rgb(59_130_246/0.7)]",
  sky: "from-tile-sky to-brand-500 shadow-[0_10px_22px_-10px_rgb(14_165_233/0.7)]",
  violet: "from-tile-violet to-brand-800 shadow-[0_10px_22px_-10px_rgb(139_92_246/0.8)]",
};
