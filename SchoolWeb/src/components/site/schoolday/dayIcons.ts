import {
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  DoorOpen,
  LayoutDashboard,
  MessageCircleHeart,
  ReceiptText,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { SchoolDayMini } from "@/lib/site/content";

export const DAY_ICONS: Record<SchoolDayMini, LucideIcon> = {
  gate: DoorOpen,
  attendance: ClipboardCheck,
  substitute: CalendarClock,
  proof: ReceiptText,
  diary: BookOpenCheck,
  pickup: UsersRound,
  dashboard: LayoutDashboard,
  message: MessageCircleHeart,
};
