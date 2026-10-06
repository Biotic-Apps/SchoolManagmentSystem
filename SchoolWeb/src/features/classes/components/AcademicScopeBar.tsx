"use client";

import { FilterSelect } from "@/components/shared/FilterSelect";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import type { AcademicScope } from "../use-academic-scope";

interface AcademicScopeBarProps {
  scope: AcademicScope;
  /** Show the class filter (with an "All classes" choice). */
  withClass?: boolean;
}

/** Branch (when more than one), session and optional class pickers bound to useAcademicScope. */
export function AcademicScopeBar({ scope, withClass }: AcademicScopeBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <BranchPickerSelect picker={scope.picker} className="md:w-56" />
      <OptionSelect
        label="Session"
        options={scope.sessions.options}
        value={scope.sessionId}
        onChange={scope.setSessionId}
        className="md:w-48"
      />
      {withClass && (
        <FilterSelect
          label="Class"
          allLabel="All classes"
          options={scope.classes.options}
          value={scope.classId}
          onChange={scope.setClassId}
        />
      )}
    </div>
  );
}
