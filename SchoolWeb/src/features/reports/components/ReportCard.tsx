import { FileSpreadsheet } from "lucide-react";
import { IconTile } from "@/components/shared/IconTile";
import { cardInteractive, cardSurface, focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Report } from "../types";

export function ReportCard({ report, onSelect }: { report: Report; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 p-5 text-left",
        cardSurface,
        cardInteractive,
        focusRing,
      )}
    >
      <IconTile icon={FileSpreadsheet} />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-body font-semibold text-fg">{report.name}</span>
        {report.description && <span className="text-label text-fg-muted">{report.description}</span>}
        <span className="text-caption text-fg-muted">{report.formats.join(" · ")}</span>
      </span>
    </button>
  );
}
