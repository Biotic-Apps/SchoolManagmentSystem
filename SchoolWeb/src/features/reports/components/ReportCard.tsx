import { FileSpreadsheet } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Report } from "../types";

export function ReportCard({ report, onSelect }: { report: Report; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-card border border-border bg-surface p-5 text-left transition-colors hover:bg-selected/60",
        focusRing,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-input bg-selected text-primary">
        <FileSpreadsheet className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-body font-semibold text-fg">{report.name}</span>
        {report.description && <span className="text-label text-fg-muted">{report.description}</span>}
        <span className="text-caption text-fg-muted">{report.formats.join(" · ")}</span>
      </span>
    </button>
  );
}
