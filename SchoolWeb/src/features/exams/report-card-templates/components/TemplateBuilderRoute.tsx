"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useCan } from "@/features/auth/use-can";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/Sheet";
import { useReportCardTemplates, useReportCardTemplate } from "../templates-api";
import { TemplateForm } from "./TemplateForm";
import { TemplateList } from "./TemplateList";

export function TemplateBuilderRoute() {
  const [editId, setEditId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const can = useCan();

  const { data: templates, isLoading } = useReportCardTemplates();
  const { data: editTemplate, isError: editFailed } = useReportCardTemplate(editId);

  const openCreate = () => {
    setEditId(null);
    setSheetOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/exams" className="inline-flex items-center gap-1 self-start text-label text-fg-muted hover:text-fg">
        <ArrowLeft className="size-4" />
        Exams & Results
      </Link>
      <PageHeader
        title="Report Card Templates"
        description="Configure the layout and sections of printed report cards."
        actions={
          can("exams.add") ? (
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 size-4" />
              Create template
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <TemplateList
          templates={templates ?? []}
          onEdit={openEdit}
          canEdit={can("exams.edit")}
          canDelete={can("exams.delete")}
        />
      )}

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent>
          <div className="flex shrink-0 flex-col gap-1 border-b border-border px-5 py-5 pr-12 sm:px-6">
            <SheetTitle className="text-card-title font-semibold tracking-[-0.01em] text-fg">
              {editId ? "Edit template" : "New template"}
            </SheetTitle>
            <SheetDescription className="text-label text-fg-muted">
              {editId ? "Update the template settings below." : "Configure a new report card template."}
            </SheetDescription>
          </div>
          <div className="flex min-h-0 flex-1 scroll-pt-4 flex-col overflow-y-auto px-5 py-5 sm:px-6">
            {/* Edit waits for the template so the form starts pre-filled. */}
            {sheetOpen && editId && !editTemplate ? (
              editFailed ? (
                <p className="text-body text-error">Couldn&apos;t load this template.</p>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-6" />
                </div>
              )
            ) : (
              sheetOpen && (
                <TemplateForm
                  key={editTemplate?.id ?? "new"}
                  template={editId ? (editTemplate ?? null) : null}
                  onClose={closeSheet}
                />
              )
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
