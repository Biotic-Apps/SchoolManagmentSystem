import { Reveal } from "@/components/site/motion/Reveal";
import { HERO_CAPABILITY } from "@/lib/site/content";

/** What the product handles, as four facts along the foot of the hero. */
export function HeroCapability() {
  return (
    <div className="relative mx-auto max-w-7xl px-5 pb-16 sm:px-8">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HERO_CAPABILITY.map((item, index) => (
          <Reveal as="li" key={item.label} delay={0.1 + index * 0.08}>
            <div className="flex h-full items-baseline gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-4 sm:px-5">
              <span className="bg-gradient-to-br from-brand-600 to-accent-500 bg-clip-text text-[1.3rem] font-semibold leading-none tracking-[-0.03em] text-transparent sm:text-[1.5rem]">
                {item.figure}
              </span>
              <span className="text-[0.8rem] leading-snug text-muted">{item.label}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
