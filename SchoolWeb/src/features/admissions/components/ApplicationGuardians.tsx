import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";
import type { GuardianEntry } from "@/features/people/types";

/** Parents and guardians on the application, primary contact first. */
export function ApplicationGuardians({ guardians }: { guardians: GuardianEntry[] | undefined }) {
  const rows = [...(guardians ?? [])].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Parents & guardians" />
      {rows.length === 0 && <p className="text-label text-fg-muted">No guardians on this application.</p>}
      <ul className="flex flex-col gap-2">
        {rows.map((guardian, index) => (
          <li key={`${guardian.phone}-${index}`} className="flex flex-col gap-1 rounded-input border border-border p-3">
            <span className="flex flex-wrap items-center gap-2 text-label font-medium text-fg">
              {guardian.name}
              <span className="font-normal text-fg-muted">{optionName(RELATION_OPTIONS, guardian.relation)}</span>
              {guardian.isPrimary && <Badge tone="primary">Primary contact</Badge>}
            </span>
            <span className="text-caption text-fg-muted">
              {[guardian.phone, guardian.email, guardian.cnic && `CNIC ${guardian.cnic}`, guardian.occupation]
                .filter(Boolean)
                .join(" · ")}
            </span>
            {guardian.address && <span className="text-caption text-fg-muted">{guardian.address}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
