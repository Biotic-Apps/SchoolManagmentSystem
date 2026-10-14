import {
  CalendarCheck,
  ClipboardList,
  HelpCircle,
  LayoutGrid,
  type LucideIcon,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";

/** One icon per nav destination, keyed by the section or page it opens. */
const ICONS: Record<string, LucideIcon> = {
  "/#attendance": CalendarCheck,
  "/#academics": ClipboardList,
  "/#fees": Wallet,
  "/#parents": Users,
  "/#modules": LayoutGrid,
  "/#how-it-works": Workflow,
  "/#built-for-pakistan": MapPin,
  "/#security": ShieldCheck,
  "/#faq": HelpCircle,
  "/contact": Mail,
};

export function navIcon(href: string): LucideIcon {
  return ICONS[href] ?? LayoutGrid;
}
