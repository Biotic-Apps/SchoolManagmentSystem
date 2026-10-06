"use client";

import { useIsParent } from "@/features/auth/use-active-child";
import { ParentMeetings } from "./ParentMeetings";
import { StaffMeetings } from "./StaffMeetings";

export function MeetingsRoute() {
  return useIsParent() ? <ParentMeetings /> : <StaffMeetings />;
}
