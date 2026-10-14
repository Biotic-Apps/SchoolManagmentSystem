import { MessageCircleQuestion } from "lucide-react";
import { FaqAccordion } from "./faq/FaqAccordion";
import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** Frequently asked questions: intro + help card on the left, accordion on the right (stacked on phones). */
export function FaqSection() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <LandingContainer className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            align="left"
            eyebrow="FAQ"
            title={
              <>
                Questions, <span className="text-gradient">answered</span>
              </>
            }
            description="Everything schools, teachers and parents usually ask before they get started."
          />
          <Reveal delay={120} className="max-w-xl">
            <div className="relative overflow-hidden rounded-card bg-card-bg p-6">
              <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/15 blur-2xl" />
              <div className="relative flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-tile bg-white text-primary shadow-card">
                  <MessageCircleQuestion className="size-5" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-body font-semibold text-fg">Still have questions?</p>
                  <p className="text-body text-fg-muted">
                    Contact your school admin. They manage your account and can help with sign-in, classes and fees.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <FaqAccordion />
      </LandingContainer>
    </section>
  );
}
