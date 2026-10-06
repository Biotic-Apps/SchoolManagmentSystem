"use client";

import type { ReactNode } from "react";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import type { SectionScope } from "../use-section-scope";

interface SectionScopeBarProps {
  scope: SectionScope;
  /** Extra controls on the same row, e.g. a DateStepper. */
  children?: ReactNode;
}

/** Branch (when more than one), session and section pickers bound to useSectionScope. Changes ask first when a child has unsaved edits. */
export function SectionScopeBar({ scope, children }: SectionScopeBarProps) {
  const academic = scope.scope;
  const guard = useGuardedAction();
  const picker = { ...academic.picker, setBranchId: (id: string) => guard(() => academic.picker.setBranchId(id)) };
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <BranchPickerSelect picker={picker} className="md:w-56" />
      {academic.sessions.options.length > 1 && (
        <OptionSelect
          label="Session"
          options={academic.sessions.options}
          value={academic.sessionId}
          onChange={(id) => guard(() => academic.setSessionId(id))}
          className="md:w-44"
        />
      )}
      <OptionSelect
        label="Section"
        options={scope.sectionOptions}
        value={scope.sectionId}
        onChange={(id) => guard(() => scope.setSectionId(id))}
        className="md:w-48"
      />
      {children}
    </div>
  );
}
