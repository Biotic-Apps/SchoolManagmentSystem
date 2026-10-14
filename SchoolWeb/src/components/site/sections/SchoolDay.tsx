import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { DayRail } from "@/components/site/schoolday/DayRail";
import { DayStack } from "@/components/site/schoolday/DayStack";
import { SCHOOL_DAY_COPY } from "@/lib/site/content";

/**
 * "A school day with eSchool": eight moments from the 7:30 AM gate to the
 * 8:00 PM diary at home. Desktop drags sideways under a sun to moon strip;
 * phones read it top to bottom. No scroll pinning anywhere.
 */
export function SchoolDay() {
  return (
    <section id="school-day" className="overflow-hidden bg-surface-sunken py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={SCHOOL_DAY_COPY.eyebrow}
          title={SCHOOL_DAY_COPY.title}
          body={SCHOOL_DAY_COPY.body}
        />
        <div className="mt-12 lg:mt-14">
          <DayRail />
          <DayStack />
        </div>
      </div>
    </section>
  );
}
