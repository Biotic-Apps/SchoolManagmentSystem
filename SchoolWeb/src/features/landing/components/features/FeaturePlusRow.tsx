import { Plus } from "lucide-react";
import { Reveal } from "../Reveal";
import { featureExtras } from "./featureGroups";

/** "Plus" row of small extras that apply across the whole system. */
export function FeaturePlusRow() {
  return (
    <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
      <span className="inline-flex items-center gap-1.5 text-label font-semibold text-on-selected">
        <Plus className="size-4" aria-hidden />
        Plus
      </span>
      <ul className="contents">
        {featureExtras.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-caption font-medium text-fg shadow-card transition-colors duration-(--dur-standard) hover:border-primary/60 hover:bg-selected"
          >
            <Icon className="size-3.5 text-primary" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
