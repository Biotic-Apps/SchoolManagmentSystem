import { Plus } from "lucide-react";
import { Reveal } from "../Reveal";
import { FAQ_ITEMS } from "./faqItems";

/** The question list: white cards built on <details>, one open at a time (shared `name`). */
export function FaqAccordion() {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {FAQ_ITEMS.map((item, index) => (
        <Reveal key={item.question} delay={index * 60}>
          <details
            name="landing-faq"
            open={index === 0}
            className="group rounded-card border border-border bg-white shadow-card transition-[border-color,box-shadow] duration-(--dur-standard) hover:border-primary/40 open:border-primary open:shadow-raised"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-5 py-4 text-left text-body font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">{item.question}</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-selected text-on-selected transition-[rotate,background-color,color] duration-(--dur-standard) ease-standard group-open:rotate-45 group-open:bg-primary group-open:text-white">
                <Plus className="size-4" aria-hidden />
              </span>
            </summary>
            <p className="px-5 pb-5 text-body text-fg-muted sm:pr-16">{item.answer}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
