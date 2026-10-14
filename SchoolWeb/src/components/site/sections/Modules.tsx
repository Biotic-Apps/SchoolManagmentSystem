import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { ModuleExplorer } from "@/components/site/modules/ModuleExplorer";
import { MODULES_COPY } from "@/lib/site/content";

/**
 * The full module map as a bento of cards, filterable by who uses them.
 * A principal can tap "Accountant" and see exactly what the bursar gets.
 */
export function Modules() {
  return (
    <Section id="modules" tone="sunken">
      <SectionHeading
        eyebrow={MODULES_COPY.eyebrow}
        title={MODULES_COPY.title}
        body={MODULES_COPY.body}
      />
      <Reveal delay={0.12}>
        <ModuleExplorer />
      </Reveal>
    </Section>
  );
}
