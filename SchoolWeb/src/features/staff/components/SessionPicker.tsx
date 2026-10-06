"use client";

import { OptionSelect } from "@/components/shared/OptionSelect";
import type { StaffSessionPicker } from "../use-staff-session";

export function SessionPicker({ picker }: { picker: StaffSessionPicker }) {
  return (
    <OptionSelect
      label="Session"
      options={picker.options}
      value={picker.sessionId}
      onChange={picker.setSessionId}
      className="md:w-56"
    />
  );
}
