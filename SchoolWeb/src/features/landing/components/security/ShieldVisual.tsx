import { ShieldCheck } from "lucide-react";

/** Big glowing shield with concentric pulsing rings. Decorative. */
export function ShieldVisual() {
  return (
    <div aria-hidden className="relative mx-auto grid size-[260px] place-items-center sm:size-[300px]">
      <div className="absolute inset-0 rounded-full bg-[#7B68EE]/20 blur-3xl" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-primary/30 motion-safe:animate-ping"
          style={{ animationDuration: "3.6s", animationDelay: `${i * 1.2}s` }}
        />
      ))}
      <span className="absolute inset-[18%] rounded-full border border-border bg-white/60" />
      <div className="relative grid size-36 place-items-center rounded-full bg-gradient-to-br from-[#7B68EE] via-[#6A5ACD] to-[#4C3D99] shadow-[0_20px_60px_-10px_rgb(123_104_238/0.7)] sm:size-40">
        <span className="absolute inset-2 rounded-full ring-1 ring-inset ring-white/25" />
        <ShieldCheck className="size-16 text-white sm:size-20" strokeWidth={1.6} />
      </div>
    </div>
  );
}
