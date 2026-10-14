"use client";

import { useId, useState } from "react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { ChatBubbles } from "@/components/site/faq/ChatBubbles";
import { FaqItem } from "@/components/site/faq/FaqItem";
import { FAQ, FAQ_COPY } from "@/lib/site/content";

/**
 * Two columns on large screens: the heading and a small chat illustration stay
 * pinned on the left while the question cards scroll past on the right.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <Section id="faq" tone="sunken">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow={FAQ_COPY.eyebrow} title={FAQ_COPY.title} body={FAQ_COPY.body} />
          <ChatBubbles />
        </div>

        <div className="flex flex-col gap-3">
          {FAQ.map((entry, index) => (
            <Reveal soft key={entry.q} delay={Math.min(index, 5) * 0.06}>
              <FaqItem
                q={entry.q}
                a={entry.a}
                open={open === index}
                onToggle={() => setOpen(open === index ? null : index)}
                baseId={baseId}
                index={index}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
