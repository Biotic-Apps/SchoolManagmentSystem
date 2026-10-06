"use client";

import { Plus } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Period } from "../types";
import { useBellScheduleForm } from "../use-bell-schedule-form";
import { BellPeriodRow } from "./BellPeriodRow";

interface BellScheduleEditorProps {
  branchId: string;
  periods: Period[];
}

export function BellScheduleEditor({ branchId, periods }: BellScheduleEditorProps) {
  const bell = useBellScheduleForm(branchId, periods);
  const count = bell.fields.length;

  return (
    <FormProvider {...bell.form}>
      <form onSubmit={bell.submit} noValidate className="flex flex-col gap-4">
        <InlineNotice>
          Periods are numbered in this order. Mark lunch or assembly as a break so no lessons are placed there.
        </InlineNotice>
        <FormAlert message={bell.formError} />
        <Card className="flex flex-col divide-y divide-border">
          {bell.fields.map((field, index) => (
            <BellPeriodRow
              key={field.id}
              index={index}
              count={count}
              onRemove={() => bell.remove(index)}
              onMoveUp={() => bell.moveUp(index)}
              onMoveDown={() => bell.moveDown(index)}
            />
          ))}
          {count === 0 && <p className="px-4 py-6 text-center text-label text-fg-muted">No periods yet. Add the first one.</p>}
        </Card>
        {bell.listError && (
          <p role="alert" className="text-caption text-error">
            {bell.listError}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={bell.add}>
            <Plus />
            Add period
          </Button>
          <div className="flex gap-2">
            {bell.dirty && (
              <Button variant="ghost" onClick={bell.discard} disabled={bell.submitting}>
                Discard changes
              </Button>
            )}
            <Button type="submit" loading={bell.submitting}>
              Save bell schedule
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
