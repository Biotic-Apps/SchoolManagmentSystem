import { DetailList } from "@/components/shared/DetailList";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { EMPTY_VALUE, formatDateTime, textOrDash } from "@/lib/format";
import type { ApplicationTest } from "../types";

/** Entrance test schedule and result; hidden until a test is scheduled. */
export function ApplicationTestBlock({ test }: { test: ApplicationTest | null }) {
  if (!test) return null;
  const score = test.score != null ? `${test.score} / ${test.maxScore ?? EMPTY_VALUE}` : "Not recorded yet";

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Entrance test" />
      <DetailList
        items={[
          { label: "Scheduled at", value: formatDateTime(test.scheduledAt) },
          { label: "Venue", value: textOrDash(test.venue) },
          { label: "Score", value: score },
          { label: "Remarks", value: textOrDash(test.remarks) },
        ]}
      />
    </section>
  );
}
