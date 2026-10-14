import { CompareSlider } from "@/components/site/compare/CompareSlider";
import { CompareStats } from "@/components/site/compare/CompareStats";
import { Reveal } from "@/components/site/motion/Reveal";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { COMPARE_COPY as COPY } from "@/lib/site/content";

/** Paper against eSchool: a draggable before/after card and four example numbers. */
export function PaperVsESchool() {
  return (
    <section id="compare" className="py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={COPY.eyebrow} title={COPY.title} body={COPY.body} align="center" />
        <Reveal className="mt-12">
          <CompareSlider />
        </Reveal>
        <CompareStats />
      </div>
    </section>
  );
}
