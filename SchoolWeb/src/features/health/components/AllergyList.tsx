import { Badge } from "@/components/ui/Badge";
import { humanize } from "@/lib/format";
import { allergyTone } from "../options";
import type { Allergy } from "../types";

/** Allergy name, severity badge and the reaction to watch for. */
export function AllergyList({ allergies }: { allergies: Allergy[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {allergies.map((allergy, index) => (
        <li key={`${allergy.name}-${index}`} className="flex flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-label font-medium text-fg">{allergy.name}</span>
            {allergy.severity && <Badge tone={allergyTone(allergy.severity)}>{humanize(allergy.severity)}</Badge>}
          </span>
          {allergy.reaction && <span className="text-caption text-fg-muted">Reaction: {allergy.reaction}</span>}
        </li>
      ))}
    </ul>
  );
}
