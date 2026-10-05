import { School as SchoolIcon } from "lucide-react";
import type { School } from "../types";

export function SchoolName({ school }: { school: Pick<School, "name" | "logoUrl"> }) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-input border border-border bg-background">
        {school.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs, not optimizable
          <img src={school.logoUrl} alt="" className="size-full object-contain" />
        ) : (
          <SchoolIcon className="size-4 text-fg-muted" />
        )}
      </span>
      <span className="font-medium">{school.name}</span>
    </span>
  );
}
