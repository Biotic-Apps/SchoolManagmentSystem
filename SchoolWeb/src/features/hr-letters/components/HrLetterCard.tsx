"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { hrLetterTypeLabel } from "../options";
import type { HrLetter } from "../types";

interface HrLetterCardProps {
  letter: HrLetter;
}

export function HrLetterCard({ letter }: HrLetterCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border p-4">
      <div className="rounded-md bg-surface-raised p-2">
        <FileText className="h-5 w-5 text-fg-muted" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-body font-medium text-fg">{letter.subject}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-label text-fg-muted">
          <span>{hrLetterTypeLabel(letter.type)}</span>
          <span>{formatDateTime(letter.issuedAt)}</span>
        </div>
      </div>
      {letter.fileUrl && (
        <Button size="sm" variant="secondary" asChild>
          <a href={letter.fileUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            PDF
          </a>
        </Button>
      )}
    </div>
  );
}
