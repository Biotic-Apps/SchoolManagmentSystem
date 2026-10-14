import {
  CalendarCheck,
  ClipboardList,
  HelpCircle,
  House,
  LayoutGrid,
  type LucideIcon,
  Mail,
  MapPin,
  ShieldCheck,
  Shield,
  Smartphone,
  Sun,
  UserCog,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";

/** One icon per nav destination, keyed by the section or page it opens. */
const ICONS: Record<string, LucideIcon> = {
  "/#top": House,
  "/#attendance": CalendarCheck,
  "/#academics": ClipboardList,
  "/#fees": Wallet,
  "/#parents": Users,
  "/#modules": LayoutGrid,
  "/#how-it-works": Workflow,
  "/#roles": UserCog,
  "/#school-day": Sun,
  "/#android-app": Smartphone,
  "/privacy-policy": Shield,
  "/#built-for-pakistan": MapPin,
  "/#security": ShieldCheck,
  "/#faq": HelpCircle,
  "/contact": Mail,
};

export function navIcon(href: string): LucideIcon {
  return ICONS[href] ?? LayoutGrid;
}
