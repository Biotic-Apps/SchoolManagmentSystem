import Link from "next/link";
import { CalendarPlus, CreditCard, MessageSquareText, PlaneTakeoff, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/shared/IconTile";
import { Card } from "@/components/ui/Card";
import type { ParentHome } from "../../types";
import type { ParentLinks } from "../../use-parent-home";

interface Action {
  label: string;
  hint: string;
  icon: LucideIcon;
  href: string | null;
}

/** The four things parents do most, each opening its page. */
export function ParentQuickActions({ data, links }: { data: ParentHome; links: ParentLinks }) {
  const teacher = data.child.classTeacher?.name;
  const actions: Action[] = [
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
  const shown = actions.filter((a): a is Action & { href: string } => !!a.href);
  if (shown.length === 0) return null;

  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {shown.map((action) => (
        <Card key={action.label} interactive className="relative p-4">
          <Link
            href={action.href}
            className="flex flex-col items-start gap-2 outline-none sm:flex-row sm:items-center sm:gap-3 after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            <IconTile icon={action.icon} size="sm" />
            <span className="flex min-w-0 flex-col">
              <span className="text-label font-semibold leading-5 text-fg sm:truncate">{action.label}</span>
              <span className="hidden truncate text-caption text-fg-muted sm:block">{action.hint}</span>
            </span>
          </Link>
        </Card>
      ))}
    </nav>
  );
}
