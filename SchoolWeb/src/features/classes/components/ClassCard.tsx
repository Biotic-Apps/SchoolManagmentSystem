"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cardInteractive, cardSurface } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { classSetupHref } from "../links";
import type { ClassOverview } from "../setup-types";
import { countLabel } from "../text";
import { ClassIssueChips } from "./ClassIssueChips";
import { SectionChip } from "./SectionChip";
import { TimetableStateLine } from "./TimetableStateLine";

interface ClassCardProps {
  item: ClassOverview;
  branchId: string;
  sessionId: string | null;
  onOpen: () => void;
}

const SUBJECTS_SHOWN = 4;

/** One class at a glance: sections with class teachers, subjects, open issues and timetable state. */
export function ClassCard({ item, branchId, sessionId, onOpen }: ClassCardProps) {
  const names = item.subjects.map((subject) => subject.name);
  const more = names.length - SUBJECTS_SHOWN;

  return (
    <article
      onClick={onOpen}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-3 p-4",
        cardSurface,
        cardInteractive,
        item.status !== "ACTIVE" && "opacity-70",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-card-title font-semibold text-fg">
            {/* Keyboard route to the same action as clicking the card (the card holds links, so it can't be a button). */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen();
              }}
              className="max-w-full truncate rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {item.name}
            </button>
          </h3>
          <p className="text-caption text-fg-muted">
            {countLabel(item.studentCount, "student")} · {countLabel(item.sections.length, "section")}
            {item.status !== "ACTIVE" && " · Archived"}
          </p>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href={classSetupHref(item.id, branchId, sessionId)} onClick={(event) => event.stopPropagation()}>
            Set up
            <ChevronRight />
          </Link>
        </Button>
      </header>

      {item.sections.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-medium text-fg-muted">Sections</span>
          <div className="flex flex-wrap gap-1.5">
            {item.sections.map((section) => (
              <SectionChip key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}

      <p className="text-label text-fg" title={names.join(", ")}>
        <span className="text-caption font-medium text-fg-muted">Subjects </span>
        <span className="font-semibold tabular-nums">{formatNumber(names.length)}</span>
        {names.length > 0 && (
          <span className="text-fg-muted">
            {" "}
            · {names.slice(0, SUBJECTS_SHOWN).join(", ")}
            {more > 0 && ` +${more}`}
          </span>
        )}
      </p>

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
        <ClassIssueChips item={item} branchId={branchId} sessionId={sessionId} />
        <TimetableStateLine sections={item.sections} />
      </div>
    </article>
  );
}
