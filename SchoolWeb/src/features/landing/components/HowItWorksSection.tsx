import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { StepCard } from "./how/StepCard";
import { StepConnector } from "./how/StepConnector";
import { LANDING_STEPS } from "./how/stepData";

/** Four numbered steps linked by a dashed line that draws itself in (horizontal on lg, vertical on mobile). */
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-[#F7F5FF] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" aria-hidden />
      <LandingContainer className="relative">
        <SectionHeader
          eyebrow="How it works"
          title={<>Up and running <span className="text-gradient">in a day</span></>}
          description="No long training or setup projects. Four simple steps and your whole school is live."
        />

        <Reveal className="relative mt-14 lg:mt-20">
          <StepConnector orientation="horizontal" className="left-[12.5%] right-[12.5%] top-[23px] hidden h-2.5 w-[75%] lg:block" />
          <StepConnector orientation="vertical" className="bottom-8 left-[23px] top-8 w-2.5 lg:hidden" />
          <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
            {LANDING_STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} number={i + 1} />
            ))}
          </ol>
        </Reveal>

        <Reveal delay={300} className="mt-14 flex justify-center">
          <Button asChild size="lg" className="px-7">
            <Link href="/login">
              Sign in
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </Reveal>
      </LandingContainer>
    </section>
  );
}
