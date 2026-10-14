import { Smartphone } from "lucide-react";
import { ANDROID_APP_COPY as COPY } from "@/lib/site/content";

/** A plain availability note. Deliberately not a store button: there is no public listing. */
export function AppBadge() {
  return (
    <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-white/10 py-2.5 pl-2.5 pr-5 ring-1 ring-inset ring-white/20">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-700">
        <Smartphone className="size-5" strokeWidth={2.2} />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/60">
          {COPY.badge}
        </span>
        <span className="mt-0.5 block font-semibold text-white">{COPY.badgeNote}</span>
      </span>
    </div>
  );
}
