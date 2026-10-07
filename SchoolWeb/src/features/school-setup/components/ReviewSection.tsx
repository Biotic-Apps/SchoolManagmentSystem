import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SummaryRow } from "../summary";

interface ReviewSectionProps {
  title: string;
  rows: SummaryRow[];
  onEdit: () => void;
}

export function ReviewSection({ title, rows, onEdit }: ReviewSectionProps) {
  return (
    <section className="rounded-input border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <h4 className="text-label font-semibold text-fg">{title}</h4>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>
          <Pencil />
          Edit
        </Button>
      </div>
      <dl className="grid gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[10rem_1fr]">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-caption text-fg-muted sm:text-label">{row.label}</dt>
            <dd className="mb-1 break-words text-label text-fg sm:mb-0">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
