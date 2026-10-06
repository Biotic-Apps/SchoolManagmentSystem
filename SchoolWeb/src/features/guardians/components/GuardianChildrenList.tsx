import Link from "next/link";
import { Plus, Unlink } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { RELATION_OPTIONS, optionName } from "@/features/people/options";
import { placementLabel } from "@/features/students/options";
import type { GuardianChild } from "../types";

interface GuardianChildrenListProps {
  items: GuardianChild[];
  onLink?: () => void;
  onUnlink?: (child: GuardianChild) => void;
}

export function GuardianChildrenList({ items, onLink, onUnlink }: GuardianChildrenListProps) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title="Children"
        actions={
          onLink && (
            <Button variant="secondary" size="sm" onClick={onLink}>
              <Plus />
              Link child
            </Button>
          )
        }
      />
      {items.length === 0 && <p className="text-label text-fg-muted">No children linked.</p>}
      <ul className="flex flex-col gap-2">
        {items.map((child) => (
          <li
            key={child.studentId}
            className="flex items-start justify-between gap-3 rounded-input border border-border px-3 py-2"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <Link href={`/students/${child.studentId}`} className="font-medium text-primary hover:underline">
                {child.name}
              </Link>
              <span className="text-caption text-fg-muted">
                {placementLabel(child.className, child.sectionName)} · {optionName(RELATION_OPTIONS, child.relation)}
              </span>
              <span>
                <StatusBadge status={child.status} />
              </span>
            </div>
            {onUnlink && (
              <Button variant="ghost" size="sm" onClick={() => onUnlink(child)} aria-label={`Unlink ${child.name}`}>
                <Unlink />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
