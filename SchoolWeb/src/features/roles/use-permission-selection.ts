import { useMemo } from "react";
import { useController, useFormContext } from "react-hook-form";
import { fieldError } from "@/components/shared/form/field-error";
import { columnKeys, selectionState, setKeys, type MatrixAction, type MatrixRow } from "./permission-matrix";
import type { RoleFormValues } from "./schemas";

/** Binds the permission matrix to the role form's `permissions` array. */
export function usePermissionSelection(rows: MatrixRow[]) {
  const { control, formState } = useFormContext<RoleFormValues>();
  const { field } = useController({ control, name: "permissions" });
  const value = field.value;
  const selected = useMemo(() => new Set(value), [value]);

  const set = (keys: string[], on: boolean) => field.onChange(setKeys(value, keys, on));

  return {
    selected,
    count: value.length,
    error: fieldError(formState.errors, "permissions")?.message,
    toggle: (key: string, on: boolean) => set([key], on),
    rowState: (row: MatrixRow) => selectionState(selected, row.keys),
    toggleRow: (row: MatrixRow, on: boolean) => set(row.keys, on),
    columnState: (action: MatrixAction) => selectionState(selected, columnKeys(rows, action)),
    toggleColumn: (action: MatrixAction, on: boolean) => set(columnKeys(rows, action), on),
  };
}

export type PermissionSelection = ReturnType<typeof usePermissionSelection>;
