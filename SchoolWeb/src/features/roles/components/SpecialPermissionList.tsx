"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import type { Permission } from "../types";
import type { PermissionSelection } from "../use-permission-selection";

interface SpecialPermissionListProps {
  permissions: Permission[];
  selection: PermissionSelection;
  readOnly: boolean;
}

export function SpecialPermissionList({ permissions, selection, readOnly }: SpecialPermissionListProps) {
  if (permissions.length === 0) return null;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label font-medium text-fg">Special permissions</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {permissions.map((permission) => (
          <label
            key={permission.key}
            className="flex items-start gap-3 rounded-input border border-border px-3 py-2.5 hover:bg-selected/40"
          >
            <Checkbox
              className="mt-0.5"
              checked={selection.selected.has(permission.key)}
              onCheckedChange={(checked) => selection.toggle(permission.key, checked === true)}
              disabled={readOnly}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-label text-fg">{permission.description}</span>
              <span className="font-mono text-caption text-fg-muted">{permission.key}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
