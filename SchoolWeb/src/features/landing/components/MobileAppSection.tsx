import { Smartphone } from "lucide-react";
import { LandingContainer } from "./LandingContainer";
import { MobileFeatureList } from "./mobile/MobileFeatureList";
import { PhonesVisual } from "./mobile/PhonesVisual";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** Dark section showcasing the Android app for teachers and parents. */
export function MobileAppSection() {
  return (
    <section
      id="mobile-app"
      className="relative overflow-hidden bg-gradient-to-br from-[#2A1F6B] via-[#3B2D8F] to-[#5B4BC7] py-20 sm:py-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="animate-drift absolute -left-32 top-0 size-[420px] rounded-full bg-[#7B68EE]/40 blur-3xl" />
        <div className="animate-drift absolute -right-24 bottom-0 size-[380px] rounded-full bg-accent-pink/25 blur-3xl [animation-delay:-8s]" />
        <div className="animate-drift absolute left-1/2 top-1/3 size-[300px] rounded-full bg-accent-cyan/15 blur-3xl [animation-delay:-16s]" />
      </div>

      <LandingContainer className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-8">
          <SectionHeader
            tone="dark"
            align="left"
            eyebrow="Mobile app"
            title="Your school in your pocket"
            description="The eSchool Android app puts attendance, diary, results and fees in the hands of every teacher and parent."
          />
          <MobileFeatureList />
          <Reveal delay={480}>
            <div className="inline-flex flex-wrap items-center gap-3 rounded-card bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15">
              <span className="grid size-9 place-items-center rounded-tile bg-white text-primary">
                <Smartphone className="size-5" />
              </span>
              <div className="leading-tight">
                <p className="text-label font-semibold text-white">Android app</p>
                <p className="text-caption text-white/70">Ask your school for the app</p>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal from="scale" delay={150}>
          <PhonesVisual />
        </Reveal>
      </LandingContainer>
    </section>
  );
}
