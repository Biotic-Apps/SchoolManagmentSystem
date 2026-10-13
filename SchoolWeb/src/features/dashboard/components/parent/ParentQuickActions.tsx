import Link from "next/link";
import { CalendarPlus, CreditCard, MessageSquareText, PlaneTakeoff, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ParentHome } from "../../types";
import type { ParentLinks } from "../../use-parent-home";

interface Action {
  label: string;
  hint: string;
  icon: LucideIcon;
  href: string | null;
  /** Soft tinted background + icon foreground */
  bg: string;
  fg: string;
}

const ACCENT_STYLES: { bg: string; fg: string }[] = [
  { bg: "bg-accent-purple/10", fg: "text-accent-purple" },
  { bg: "bg-accent-cyan/10", fg: "text-accent-cyan" },
  { bg: "bg-accent-pink/10", fg: "text-accent-pink" },
  { bg: "bg-accent-purple/10", fg: "text-accent-purple" },
];

/** The four things parents do most, each opening its page. */
export function ParentQuickActions({ data, links }: { data: ParentHome; links: ParentLinks }) {
  const teacher = data.child.classTeacher?.name;
  const actions: Omit<Action, "bg" | "fg">[] = [
    {
      label: data.fees?.onlineGatewayEnabled ? "Pay fees" : "Fees & payment proof",
      hint: data.fees?.proofUploadEnabled ? "Pay or upload a receipt" : "Invoices and receipts",
      icon: CreditCard,
      href: links.fees,
    },
    {
      label: "Message teacher",
      hint: teacher ? `Write to ${teacher}` : "Write to the class teacher",
      icon: MessageSquareText,
      href: links.messages,
    },
    { label: "Apply for leave", hint: "Report an absence", icon: PlaneTakeoff, href: links.attendance },
    { label: "Book a meeting", hint: "Pick a time with a teacher", icon: CalendarPlus, href: links.meetings },
  ];
  const shown = actions
    .filter((a): a is typeof a & { href: string } => !!a.href)
    .map((a, i) => ({ ...a, ...ACCENT_STYLES[i % ACCENT_STYLES.length] }));
  if (shown.length === 0) return null;

  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {shown.map((action) => (
        <Card key={action.label} interactive className="relative p-4 sm:p-5">
          <Link
            href={action.href}
            className="flex flex-col items-start gap-3 outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${action.bg}`}>
              <action.icon className={`size-5 ${action.fg}`} />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-label font-semibold leading-5 text-fg">{action.label}</span>
              <span className="line-clamp-2 text-caption text-fg-muted">{action.hint}</span>
            </span>
          </Link>
        </Card>
      ))}
    </nav>
  );
}
