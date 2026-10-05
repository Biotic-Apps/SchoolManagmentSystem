"use client";

import { nextScope, type ScopeValue } from "@/lib/scope";
import { OptionSelect, type Option } from "./OptionSelect";

interface ScopePickerProps {
  value: ScopeValue;
  onChange: (value: ScopeValue) => void;
  schools: Option[];
  branches: Option[];
  sessions: Option[];
  hideSchool?: boolean;
}

export function ScopePicker({ value, onChange, schools, branches, sessions, hideSchool }: ScopePickerProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {!hideSchool && (
        <OptionSelect
          label="School"
          options={schools}
          value={value.schoolId}
          onChange={(id) => onChange(nextScope(value, "schoolId", id))}
          className="sm:w-52"
        />
      )}
      <OptionSelect
        label="Branch"
        options={branches}
        value={value.branchId}
        onChange={(id) => onChange(nextScope(value, "branchId", id))}
        className="sm:w-52"
      />
      <OptionSelect
        label="Session"
        options={sessions}
        value={value.sessionId}
        onChange={(id) => onChange(nextScope(value, "sessionId", id))}
        className="sm:w-44"
      />
    </div>
  );
}
