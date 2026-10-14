import { ScrollDevice } from "@/components/site/motion/ScrollDevice";
import {
  ACADEMICS_COPY,
  ACADEMICS_POINTS,
  ATTENDANCE_COPY,
  ATTENDANCE_POINTS,
  FEES_COPY,
  FEES_POINTS,
  PARENT_COPY,
  PARENT_POINTS,
} from "@/lib/site/content";

/**
 * The four scroll-driven feature blocks. All of them are the same component
 * with different data — the alternating side and background are what keep them
 * from reading as a repeat. `screens` has one entry per point, so the device
 * always shows the screen the highlighted point talks about (repeats allowed).
 */

export function AttendanceShowcase() {
  return (
    <ScrollDevice
      id="attendance"
      eyebrow={ATTENDANCE_COPY.eyebrow}
      title={ATTENDANCE_COPY.title}
      body={ATTENDANCE_COPY.body}
      points={ATTENDANCE_POINTS}
      screens={["attendance", "attendance", "parent", "dashboard"]}
      tone="sunken"
    />
  );
}

export function AcademicsShowcase() {
  return (
    <ScrollDevice
      id="academics"
      eyebrow={ACADEMICS_COPY.eyebrow}
      title={ACADEMICS_COPY.title}
      body={ACADEMICS_COPY.body}
      points={ACADEMICS_POINTS}
      screens={["academics", "dashboard", "academics", "academics"]}
      tone="sunken"
      reverse
    />
  );
}

export function FeesShowcase() {
  return (
    <ScrollDevice
      id="fees"
      eyebrow={FEES_COPY.eyebrow}
      title={FEES_COPY.title}
      body={FEES_COPY.body}
      points={FEES_POINTS}
      screens={["fees", "fees", "parent", "fees"]}
    />
  );
}

export function ParentShowcase() {
  return (
    <ScrollDevice
      id="parents"
      eyebrow={PARENT_COPY.eyebrow}
      title={PARENT_COPY.title}
      body={PARENT_COPY.body}
      points={PARENT_POINTS}
      screens={["parent", "parent", "parent", "parent"]}
      tone="sunken"
      reverse
      // The module map below is the same tone; a rule keeps the two apart.
      className="border-b border-line"
    />
  );
}
