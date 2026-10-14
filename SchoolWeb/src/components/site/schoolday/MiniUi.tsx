import type { SchoolDayMini } from "@/lib/site/content";
import { MiniAttendance, MiniGate, MiniProof, MiniSubstitute } from "./MinisMorning";
import { MiniDashboard, MiniDiary, MiniMessage, MiniPickup } from "./MinisEvening";

const MINIS = {
  gate: MiniGate,
  attendance: MiniAttendance,
  substitute: MiniSubstitute,
  proof: MiniProof,
  diary: MiniDiary,
  pickup: MiniPickup,
  dashboard: MiniDashboard,
  message: MiniMessage,
} as const;

/** Picks the small looping illustration for one moment of the day. */
export function MiniUi({ kind, labels, color }: { kind: SchoolDayMini; labels: readonly string[]; color: string }) {
  const Mini = MINIS[kind];
  return <Mini labels={labels} color={color} />;
}
