import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { PAKISTAN_COPY, PAKISTAN_FACTS } from "@/lib/site/content";

/**
 * The details most imported school software gets wrong: the currency, the
 * session calendar, the phones parents actually carry and the internet a
 * classroom actually has. Worth their own section, because for a Pakistani
 * school they decide whether the software is usable at all.
 */
export function BuiltForPakistan() {
  return (
    <Section id="built-for-pakistan">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <SectionHeading
          eyebrow={PAKISTAN_COPY.eyebrow}
          title={PAKISTAN_COPY.title}
          body={PAKISTAN_COPY.body}
        />

        <Reveal delay={0.12}>
          <div className="panel shadow-[var(--shadow-card)]">
            {/* Hairlines between cells only: every cell rules its bottom edge
                except the last row, and the left column rules its right. */}
            <div className="grid sm:grid-cols-2">
              {PAKISTAN_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="border-b border-line p-6 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <p className="text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-brand-700">
                    {fact.value}
                  </p>
                  <p className="mt-3 text-[0.95rem] font-semibold tracking-tight">{fact.label}</p>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">{fact.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
