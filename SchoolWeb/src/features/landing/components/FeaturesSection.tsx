"use client";

import { useState } from "react";
import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { FeatureCard } from "./features/FeatureCard";
import { FeaturePlusRow } from "./features/FeaturePlusRow";
import { FeatureSpotlight } from "./features/FeatureSpotlight";
import { FeatureTabs, panelId, tabId } from "./features/FeatureTabs";
import { featureGroups, type FeatureGroupId } from "./features/featureGroups";

/** Every module of eSchool, grouped into six tabs: spotlight card on the left, module grid on the right. */
export function FeaturesSection() {
  const [active, setActive] = useState<FeatureGroupId>("admin");
  const group = featureGroups.find((g) => g.id === active) ?? featureGroups[0]!;

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-80 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <LandingContainer className="relative">
        <SectionHeader
          eyebrow="Features"
          title={
            <>
              Everything your school needs, <span className="text-gradient">already built in</span>
            </>
          }
          description="Admissions to report cards, fees to payroll, attendance to parent messages — one connected system for the office, classroom and home."
        />

        <Reveal delay={100} className="mt-10 sm:mt-12">
          <FeatureTabs groups={featureGroups} active={active} onChange={setActive} />
        </Reveal>

        <Reveal delay={180} className="mt-8">
          {/* Keyed by group so the panel remounts and its entry animations replay on every switch. */}
          <div
            key={group.id}
            id={panelId(group.id)}
            role="tabpanel"
            aria-labelledby={tabId(group.id)}
            tabIndex={0}
            className="grid gap-5 rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            <FeatureSpotlight group={group} />
            <ul className="grid content-start gap-3 sm:grid-cols-2">
              {group.modules.map((module, i) => (
                <FeatureCard key={module.title} module={module} index={i} />
              ))}
            </ul>
          </div>
        </Reveal>

        <FeaturePlusRow />
      </LandingContainer>
    </section>
  );
}
