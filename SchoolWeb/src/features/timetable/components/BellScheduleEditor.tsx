"use client";

import { FormProvider } from "react-hook-form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { DEFAULT_FRIDAY } from "../bell-generator";
import type { BellSchedule } from "../builder-types";
import { dayName } from "../options";
import { useBellEditor } from "../use-bell-editor";
import { BellDayRows } from "./BellDayRows";
import { BellDayTabs } from "./BellDayTabs";
import { BellGenerator } from "./BellGenerator";

interface BellScheduleEditorProps {
  branchId: string;
  bell: BellSchedule | null;
}

export function BellScheduleEditor({ branchId, bell }: BellScheduleEditorProps) {
  const editor = useBellEditor(branchId, bell);
  const active = editor.schedules[editor.active];
  const day = active?.day ?? 0;

  return (
    <FormProvider {...editor.form}>
      <form onSubmit={editor.submit} noValidate className="flex flex-col gap-4">
        <InlineNotice>
          Periods are time slots, numbered automatically. Subjects are chosen when you build the timetable. Mark assembly or
          lunch as a break so no lessons go there.
        </InlineNotice>
        <FormAlert message={editor.formError} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BellDayTabs editor={editor} />
          {day !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => editor.removeVariant(editor.active)}>
              Use the normal times on {dayName(day)}
            </Button>
          )}
        </div>
        <BellGenerator
          key={editor.active}
          dayName={day === 0 ? "every working day" : dayName(day)}
          initial={day === 5 ? DEFAULT_FRIDAY : undefined}
          onGenerate={(settings) => editor.generate(editor.active, settings)}
        />
        {active && <BellDayRows key={active.key} index={editor.active} />}
        <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background px-1 py-3">
          {editor.dirty && (
            <Button variant="ghost" onClick={editor.discard} disabled={editor.saving}>
              Discard changes
            </Button>
          )}
          <Button type="submit" loading={editor.saving} disabled={!editor.dirty}>
            Save bell schedule
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={!!editor.inUse}
        onOpenChange={(open) => !open && editor.closeInUse()}
        title="Some lessons sit on periods you removed"
        description={`These lessons would be deleted: ${(editor.inUse ?? []).join("; ") || "lessons on removed periods"}.`}
        confirmLabel="Remove these lessons and save"
        tone="danger"
        loading={editor.saving}
        onConfirm={editor.confirmDrop}
      />
    </FormProvider>
  );
}
