import type { ChecklistItem } from "./types";

export interface ChecklistItemView extends ChecklistItem {
  label: string;
  hint: string;
  href: string;
}

interface ItemCopy {
  label: string;
  hint: string;
  href: string;
}

const COPY: Record<string, ItemCopy> = {
  session: { label: "Academic session", hint: "The school year everything else belongs to", href: "/sessions" },
  classes: { label: "Classes and sections", hint: "Playgroup to Class 10, with their sections", href: "/classes" },
  subjects: { label: "Subjects", hint: "What is taught in each class", href: "/classes" },
  teachers: { label: "Add teachers", hint: "Staff with a teacher role in this branch", href: "/staff" },
  students: { label: "Add students", hint: "Admit students into their sections", href: "/admissions" },
  timetable: { label: "Make the timetable", hint: "Periods for each section", href: "/timetable" },
  feePlan: { label: "Set the fee plan", hint: "Monthly fees per class", href: "/fees" },
};

/** Adds the label, hint and link for each checklist key; unknown keys still show with a readable name. */
export function checklistView(items: ChecklistItem[], menu: ReadonlySet<string>): ChecklistItemView[] {
  return items.map((item) => {
    const copy = COPY[item.key] ?? { label: item.key.replace(/([A-Z])/g, " $1"), hint: "", href: "" };
    // Without the admissions screen, students are added from the students list.
    const href = item.key === "students" && !menu.has("admissions") ? "/students" : copy.href;
    // Only link to screens this role can open; others just show their status.
    return { ...item, ...copy, href: href && menu.has(href.slice(1)) ? href : "" };
  });
}
