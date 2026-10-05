"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { ACTION_LABELS, MATRIX_ACTIONS, type MatrixRow } from "../permission-matrix";
import type { PermissionSelection } from "../use-permission-selection";

interface PermissionGridProps {
  rows: MatrixRow[];
  selection: PermissionSelection;
  readOnly: boolean;
}

export function PermissionGrid({ rows, selection, readOnly }: PermissionGridProps) {
  return (
    <div className="max-h-[50vh] overflow-auto rounded-card border border-border">
      <table className="w-full border-collapse text-label">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left font-medium text-fg-muted">Module</th>
            {MATRIX_ACTIONS.map((action) => (
              <th key={action} className="px-2 py-2 text-center font-medium text-fg-muted">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-caption">{ACTION_LABELS[action]}</span>
                  <Checkbox
                    aria-label={`Toggle ${ACTION_LABELS[action]} for all modules`}
                    checked={selection.columnState(action)}
                    onCheckedChange={(checked) => selection.toggleColumn(action, checked === true)}
                    disabled={readOnly}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.module} className="border-b border-border last:border-b-0 hover:bg-selected/40">
              <td className="px-3 py-2">
                <label className="flex items-center gap-2 text-fg">
                  <Checkbox
                    aria-label={`Toggle all ${row.label} permissions`}
                    checked={selection.rowState(row)}
                    onCheckedChange={(checked) => selection.toggleRow(row, checked === true)}
                    disabled={readOnly}
                  />
                  {row.label}
                </label>
              </td>
              {MATRIX_ACTIONS.map((action) => {
                const permission = row.cells[action];
                return (
                  <td key={action} className="px-2 py-2 text-center">
                    {permission && (
                      <Checkbox
                        className="mx-auto"
                        aria-label={permission.description}
                        title={permission.description}
                        checked={selection.selected.has(permission.key)}
                        onCheckedChange={(checked) => selection.toggle(permission.key, checked === true)}
                        disabled={readOnly}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
