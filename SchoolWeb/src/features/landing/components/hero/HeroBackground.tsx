/** Faded dot grid + slow-drifting purple/pink glows behind the hero. Purely decorative. */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black_30%,transparent_75%)]" />
      <div className="animate-drift absolute -left-32 -top-24 size-[420px] rounded-full bg-[#a78bfa]/30 blur-[90px] sm:size-[560px]" />
      <div
        className="animate-drift absolute -right-24 top-24 size-[360px] rounded-full bg-primary/25 blur-[100px] sm:size-[520px]"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="animate-drift absolute bottom-[-120px] left-1/3 size-[320px] rounded-full bg-accent-pink/20 blur-[100px] sm:size-[440px]"
        style={{ animationDelay: "-16s" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
