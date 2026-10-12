"use client";

import { useState } from "react";
import { FileText, MoreVertical, Star, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useDeleteReportCardTemplate, useSetDefaultTemplate } from "../templates-api";
import type { ReportCardTemplate } from "../types";

interface TemplateListProps {
  templates: ReportCardTemplate[];
  onEdit: (id: string) => void;
}

function sectionSummary(t: ReportCardTemplate): string {
  const parts: string[] = [];
  if (t.showGradingScale) parts.push("Grading");
  if (t.showSkills) parts.push("Skills");
  if (t.showRemarks) parts.push("Remarks");
  if (t.showAttendance) parts.push("Attendance");
  if (t.showPosition) parts.push("Position");
  return parts.length ? parts.join(", ") : "No sections enabled";
}

export function TemplateList({ templates, onEdit }: TemplateListProps) {
  const deleteMut = useDeleteReportCardTemplate();
  const setDefault = useSetDefaultTemplate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!templates.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates yet"
        description="Create a report card template to get started."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id} className="relative">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-body font-semibold text-fg">{t.name}</span>
                  <span className="text-caption text-fg-muted">{t.branchId ? "Branch-specific" : "All branches"}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {t.isDefault && <Badge tone="primary">Default</Badge>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(t.id)}>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      {!t.isDefault && (
                        <DropdownMenuItem onClick={() => setDefault.mutate(t.id)}>
                          <Star className="mr-2 size-4" />
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-error" onClick={() => setDeleteId(t.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="text-caption text-fg-muted">
                {t.layout.orientation} &middot; {t.layout.paperSize}
              </div>
              <div className="text-caption text-fg-muted">{sectionSummary(t)}</div>
              {t.signatures.length > 0 && (
                <div className="text-caption text-fg-muted">{t.signatures.length} signature(s)</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete template"
        description="This template will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMut.isPending}
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </>
  );
}
