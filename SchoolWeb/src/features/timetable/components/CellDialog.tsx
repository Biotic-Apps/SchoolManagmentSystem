"use client";

import { Eraser } from "lucide-react";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { Button } from "@/components/ui/Button";
import type { Section } from "@/features/classes/types";
import type { CellValue } from "../grid";
import { dayName } from "../options";
import { useCellDialog } from "../use-cell-dialog";
import type { CellTarget } from "../use-timetable-editor";

interface CellDialogProps {
  section: Section;
  target: CellTarget;
  value: CellValue | undefined;
  onApply: (value: CellValue | null) => void;
  onClose: () => void;
}

export function CellDialog({ section, target, value, onApply, onClose }: CellDialogProps) {
  const cell = useCellDialog(section, value, onApply);
  const placeholder = cell.loading ? "Loading" : "Select";

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${dayName(target.day)} · ${target.row.title}`}
      description={`${section.className} ${section.name}, ${target.row.time}. Changes stay in the draft until you save.`}
      submitLabel="Apply"
      onSubmit={cell.submit}
      form={cell.form}
      error={cell.formError}
    >
      <SelectField name="subjectId" label="Subject" options={cell.subjectOptions} placeholder={placeholder} required />
      <SelectField
        name="staffId"
        label="Teacher"
        options={cell.staffOptions}
        placeholder={placeholder}
        hint="Teachers assigned to this section are listed first."
        required
      />
      <SelectField name="roomId" label="Room" options={cell.roomOptions} emptyLabel="No room" />
      {cell.canClear && (
        <Button variant="danger" size="sm" className="self-start" onClick={cell.clear}>
          <Eraser />
          Clear cell
        </Button>
      )}
    </FormDialog>
  );
}
