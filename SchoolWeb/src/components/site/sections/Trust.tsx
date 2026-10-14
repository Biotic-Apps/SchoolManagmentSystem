import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { TrustOrbit } from "@/components/site/trust/TrustOrbit";
import { TrustStack } from "@/components/site/trust/TrustStack";
import { TRUST_COPY } from "@/lib/site/content";

/**
 * Why a school can trust it with children's records, the question a principal
 * asks first. A shield locks shut at the centre and the six safeguards orbit
 * it on desktop, each tied in by its own line; phones get a stacked list.
 */
export function Trust() {
  return (
    <Section id="security" tone="sunken" className="overflow-hidden">
      <SectionHeading
        eyebrow={TRUST_COPY.eyebrow}
        title={TRUST_COPY.title}
        body={TRUST_COPY.body}
        align="center"
      />
      <div className="mt-16 lg:mt-20">
        <TrustOrbit />
        <TrustStack />
      </div>
    </Section>
  );
}
