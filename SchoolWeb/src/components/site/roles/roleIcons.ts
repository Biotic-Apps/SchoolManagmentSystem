import {
  BookOpenCheck,
  Building2,
  CalendarRange,
  Crown,
  HeartHandshake,
  type LucideIcon,
  Users,
  Wallet,
} from "lucide-react";
import type { RolePortalId } from "@/lib/site/content";

/** One icon per role, shared by the desktop list and the mobile chips. */
export const ROLE_ICONS: Record<RolePortalId, LucideIcon> = {
  superAdmin: Building2,
  principal: Crown,
  headTeacher: Users,
  coordinator: CalendarRange,
  teacher: BookOpenCheck,
  accountant: Wallet,
  parent: HeartHandshake,
};
