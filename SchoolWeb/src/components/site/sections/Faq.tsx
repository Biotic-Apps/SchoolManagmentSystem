"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { FAQ, FAQ_COPY } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";
import { refreshScrollTriggers } from "@/lib/site/scroll";

/**
 * The answers stay **mounted** whether or not they are open.
 *
 * They used to be swapped in and out through `AnimatePresence`, which meant the
 * served HTML contained nine questions and one answer. Everything a school
 * searches for — how parents sign in, whether attendance works offline — was
 * the part that was not there. A collapsed panel at `height: 0` is
 * still in the document and still indexed; it is simply not drawn.
 *
 * Opening one changes the height of the page, so the scroll-driven sections are
 * asked to re-measure once the animation has settled. Without that, every
 * trigger below the FAQ is working from stale coordinates.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <Section id="faq" tone="sunken">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <SectionHeading
          eyebrow={FAQ_COPY.eyebrow}
          title={FAQ_COPY.title}
          body={FAQ_COPY.body}
        />

        <div>
          {FAQ.map((entry, index) => {
            const isOpen = open === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <Reveal key={entry.q} delay={Math.min(index, 5) * 0.05}>
                <div className="border-b border-line">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-start gap-4 py-5 text-left"
                    >
                      <span className="flex-1 font-semibold tracking-tight">{entry.q}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-muted transition-[transform,background-color,color] duration-300",
                          isOpen ? "rotate-45 bg-brand-600 text-white" : "bg-surface-sunken",
                        )}
                      >
                        <Plus className="size-3.5" strokeWidth={2.6} />
                      </span>
                    </button>
                  </h3>

                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    // The toggle needs JavaScript to work, so without it every
                    // collapsed answer would be permanently unreachable. The
                    // `<noscript>` rule in the root layout opens all of them.
                    data-faq-panel
                    // Served open-height-less but present: `initial={false}` stops
                    // Framer writing an entrance on first paint, so the closed
                    // panels do not animate shut as the page loads.
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                    onAnimationComplete={refreshScrollTriggers}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-10 text-pretty leading-relaxed text-muted">{entry.a}</p>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
