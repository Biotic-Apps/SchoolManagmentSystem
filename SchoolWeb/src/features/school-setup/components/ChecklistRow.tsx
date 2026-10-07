import Link from "next/link";
import { ChevronRight, CircleCheck, Circle } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { ChecklistItemView } from "../checklist-items";

function RowContent({ item }: { item: ChecklistItemView }) {
  const Icon = item.done ? CircleCheck : Circle;
  return (
    <>
      <Icon className={cn("size-5 shrink-0", item.done ? "text-success" : "text-border-strong")} aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("text-label font-medium", item.done ? "text-fg-muted" : "text-fg")}>{item.label}</span>
        {item.hint && <span className="truncate text-caption text-fg-muted">{item.hint}</span>}
      </span>
      <span className="text-caption tabular-nums text-fg-muted">
        {item.done ? formatNumber(item.count) : "To do"}
        <span className="sr-only">{item.done ? " done" : ""}</span>
      </span>
      {/* Rows without a link keep the same right edge as linked ones. */}
      {item.href ? <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden /> : <span className="size-4 shrink-0" aria-hidden />}
    </>
  );
}

export function ChecklistRow({ item }: { item: ChecklistItemView }) {
  const className = "flex items-center gap-3 rounded-input px-3 py-2.5";
  return (
    <li>
      {item.href ? (
        <Link href={item.href} className={cn(className, "transition-colors hover:bg-selected/60", focusRing)}>
          <RowContent item={item} />
        </Link>
      ) : (
        <div className={className}>
          <RowContent item={item} />
        </div>
      )}
    </li>
  );
}
