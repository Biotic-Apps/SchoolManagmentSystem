import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CountBadge } from "@/components/shared/CountBadge";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

/** One-line card: label, count pill and a link to the screen. */
export function CountLinkCard({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-full items-center justify-between gap-3 rounded-card border border-border bg-surface px-5 py-4 transition-colors hover:bg-selected/60",
        focusRing,
      )}
    >
      <span className="text-label font-medium text-fg">{label}</span>
      <span className="flex items-center gap-2">
        {count > 0 ? <CountBadge count={count} /> : <span className="text-label text-fg-muted">None</span>}
        <ChevronRight className="size-4 text-fg-muted" />
      </span>
    </Link>
  );
}
