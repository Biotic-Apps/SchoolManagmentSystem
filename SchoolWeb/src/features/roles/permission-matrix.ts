import { NAV_CATALOGUE } from "@/config/navigation";
import { humanize } from "@/lib/format";
import type { Permission } from "./types";

export const MATRIX_ACTIONS = ["view", "add", "edit", "submit", "approve", "publish", "export", "delete"] as const;
export type MatrixAction = (typeof MATRIX_ACTIONS)[number];

export const ACTION_LABELS: Record<MatrixAction, string> = {
  view: "View",
  add: "Add",
  edit: "Edit",
  submit: "Submit",
  approve: "Approve",
  publish: "Publish",
  export: "Export",
  delete: "Delete",
};

export interface MatrixRow {
  module: string;
  label: string;
  cells: Partial<Record<MatrixAction, Permission>>;
  keys: string[];
}

export interface PermissionMatrix {
  rows: MatrixRow[];
  specials: Permission[];
}

const MODULE_LABELS = new Map<string, string>(NAV_CATALOGUE.map((entry) => [entry.id, entry.label]));

function isMatrixAction(action: string): action is MatrixAction {
  return (MATRIX_ACTIONS as readonly string[]).includes(action);
}

function matrixParts(permission: Permission): { module: string; action: MatrixAction } | null {
  const parts = permission.key.split(".");
  if (parts.length !== 2 || !isMatrixAction(parts[1])) return null;
  return { module: parts[0], action: parts[1] };
}

/**
 * Groups the catalogue into module rows × action columns. Keys outside the `module.action`
 * pattern, and modules with a single key (e.g. audit.view), are listed as special permissions.
 */
export function buildPermissionMatrix(catalogue: Permission[]): PermissionMatrix {
  const byModule = new Map<string, MatrixRow>();
  const specials: Permission[] = [];

  for (const permission of catalogue) {
    const parts = matrixParts(permission);
    if (!parts) {
      specials.push(permission);
      continue;
    }
    const row = byModule.get(parts.module) ?? {
      module: parts.module,
      label: MODULE_LABELS.get(parts.module) ?? humanize(parts.module),
      cells: {},
      keys: [],
    };
    row.cells[parts.action] = permission;
    row.keys.push(permission.key);
    byModule.set(parts.module, row);
  }

  const rows: MatrixRow[] = [];
  for (const row of byModule.values()) {
    if (row.keys.length > 1) rows.push(row);
    else specials.push(...Object.values(row.cells));
  }
  return { rows, specials };
}

export function columnKeys(rows: MatrixRow[], action: MatrixAction): string[] {
  return rows.flatMap((row) => (row.cells[action] ? [row.cells[action].key] : []));
}

export type SelectionState = boolean | "indeterminate";

export function selectionState(selected: ReadonlySet<string>, keys: string[]): SelectionState {
  const count = keys.filter((key) => selected.has(key)).length;
  if (count === 0) return false;
  return count === keys.length ? true : "indeterminate";
}

/** Adds or removes keys, keeping the existing order. */
export function setKeys(current: string[], keys: string[], on: boolean): string[] {
  if (on) return [...current, ...keys.filter((key) => !current.includes(key))];
  const remove = new Set(keys);
  return current.filter((key) => !remove.has(key));
}
