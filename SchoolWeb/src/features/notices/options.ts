import type { Option } from "@/components/shared/OptionSelect";
import type { Notice, NoticeAudience } from "./types";

export const NOTICE_STATUS_OPTIONS: Option[] = [
  { id: "DRAFT", name: "Draft" },
  { id: "PENDING_REVIEW", name: "Pending review" },
  { id: "PUBLISHED", name: "Published" },
  { id: "EXPIRED", name: "Expired" },
];

type NameLookup = (id: string) => string | undefined;

const PLURAL: Record<string, string> = { branch: "branches", class: "classes", section: "sections" };

function part(ids: string[] | undefined, noun: string, lookup?: NameLookup): string | null {
  if (!ids?.length) return null;
  const names = lookup ? ids.map(lookup).filter((name): name is string => !!name) : [];
  if (names.length === ids.length && names.length <= 3) return names.join(", ");
  return `${ids.length} ${ids.length === 1 ? noun : PLURAL[noun]}`;
}

/** "School-wide", "Grade 5, Grade 6 · staff only", "2 branches · 3 sections"... */
export function audienceSummary(audience: NoticeAudience, lookup?: NameLookup): string {
  const who = audience.staffOnly ? "Staff only" : null;
  if (audience.schoolWide) return ["School-wide", who].filter(Boolean).join(" · ");
  const parts = [
    part(audience.branchIds, "branch", lookup),
    part(audience.classIds, "class", lookup),
    part(audience.sectionIds, "section", lookup),
    audience.guardianIds?.length ? `${audience.guardianIds.length} parents` : null,
  ].filter(Boolean);
  if (!parts.length) return who ?? "No audience";
  return [...parts, who?.toLowerCase()].filter(Boolean).join(" · ");
}

/** Pinned first, then newest first. */
export function sortFeed(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
  });
}

export function excerpt(text: string, length = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > length ? `${flat.slice(0, length).trimEnd()}…` : flat;
}
